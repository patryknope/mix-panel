import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// MatchZy webhook event schemas
const baseEventSchema = z.object({
  event: z.string(),
  matchid: z.string(),
  api_key: z.string(),
})

const seriesStartSchema = baseEventSchema.extend({
  event: z.literal('series_start'),
  team1: z.object({
    name: z.string(),
    score: z.number(),
  }),
  team2: z.object({
    name: z.string(),
    score: z.number(),
  }),
})

const mapStartSchema = baseEventSchema.extend({
  event: z.literal('map_start'),
  map_number: z.number(),
  map_name: z.string(),
})

const roundEndSchema = baseEventSchema.extend({
  event: z.literal('round_end'),
  map_number: z.number(),
  round_number: z.number(),
  team1: z.object({
    name: z.string(),
    score: z.number(),
  }),
  team2: z.object({
    name: z.string(),
    score: z.number(),
  }),
  winner: z.object({
    side: z.string(),
    team: z.string(),
  }),
})

const mapEndSchema = baseEventSchema.extend({
  event: z.literal('map_end'),
  map_number: z.number(),
  map_name: z.string(),
  team1: z.object({
    name: z.string(),
    score: z.number(),
  }),
  team2: z.object({
    name: z.string(),
    score: z.number(),
  }),
  winner: z.object({
    side: z.string(),
    team: z.string(),
  }),
})

const seriesEndSchema = baseEventSchema.extend({
  event: z.literal('series_end'),
  team1: z.object({
    name: z.string(),
    series_score: z.number(),
  }),
  team2: z.object({
    name: z.string(),
    series_score: z.number(),
  }),
  winner: z.object({
    team: z.string(),
  }),
})

const playerStatsSchema = baseEventSchema.extend({
  event: z.literal('player_stats'),
  map_number: z.number().optional(),
  player: z.object({
    steamid: z.string(),
    name: z.string(),
    team: z.string(),
    stats: z.object({
      kills: z.number(),
      deaths: z.number(),
      assists: z.number(),
      flash_assists: z.number(),
      headshots: z.number(),
      damage: z.number(),
      rating: z.number(),
      adr: z.number(),
      kast: z.number(),
    }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate API key
    const match = await prisma.match.findUnique({
      where: {
        id: body.matchid,
        apiKey: body.api_key,
      },
      include: {
        team1: true,
        team2: true,
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid match ID or API key' },
        { status: 401 }
      )
    }

    // Handle different event types
    switch (body.event) {
      case 'series_start': {
        const data = seriesStartSchema.parse(body)
        await prisma.match.update({
          where: { id: match.id },
          data: {
            status: 'LIVE',
            startedAt: new Date(),
          },
        })
        break
      }

      case 'map_start': {
        const data = mapStartSchema.parse(body)
        await prisma.mapStat.upsert({
          where: {
            matchId_mapNumber: {
              matchId: match.id,
              mapNumber: data.map_number,
            },
          },
          update: {
            mapName: data.map_name,
            startedAt: new Date(),
          },
          create: {
            matchId: match.id,
            mapNumber: data.map_number,
            mapName: data.map_name,
            startedAt: new Date(),
          },
        })
        break
      }

      case 'round_end': {
        const data = roundEndSchema.parse(body)
        
        // Update current map scores
        await prisma.mapStat.update({
          where: {
            matchId_mapNumber: {
              matchId: match.id,
              mapNumber: data.map_number,
            },
          },
          data: {
            team1Score: data.team1.score,
            team2Score: data.team2.score,
          },
        })
        break
      }

      case 'map_end': {
        const data = mapEndSchema.parse(body)
        
        // Determine winner team ID
        let winnerId: string | null = null
        if (data.winner.team === data.team1.name) {
          winnerId = match.team1Id
        } else if (data.winner.team === data.team2.name) {
          winnerId = match.team2Id
        }

        await prisma.mapStat.update({
          where: {
            matchId_mapNumber: {
              matchId: match.id,
              mapNumber: data.map_number,
            },
          },
          data: {
            team1Score: data.team1.score,
            team2Score: data.team2.score,
            winner: winnerId,
            endedAt: new Date(),
          },
        })
        break
      }

      case 'series_end': {
        const data = seriesEndSchema.parse(body)
        
        // Determine winner team ID
        let winnerId: string | null = null
        if (data.winner.team === data.team1.name) {
          winnerId = match.team1Id
        } else if (data.winner.team === data.team2.name) {
          winnerId = match.team2Id
        }

        await prisma.match.update({
          where: { id: match.id },
          data: {
            status: 'FINISHED',
            team1Score: data.team1.series_score,
            team2Score: data.team2.series_score,
            winner: winnerId,
            endedAt: new Date(),
          },
        })

        // Mark server as available
        if (match.serverId) {
          await prisma.server.update({
            where: { id: match.serverId },
            data: { inUse: false },
          })
        }
        break
      }

      case 'player_stats': {
        const data = playerStatsSchema.parse(body)
        
        // Determine team ID
        let teamId: string
        if (data.player.team === match.team1.name) {
          teamId = match.team1Id
        } else if (data.player.team === match.team2.name) {
          teamId = match.team2Id
        } else {
          return NextResponse.json(
            { error: 'Unknown team' },
            { status: 400 }
          )
        }

        await prisma.playerStat.create({
          data: {
            matchId: match.id,
            steamId: data.player.steamid,
            name: data.player.name,
            teamId,
            mapNumber: data.map_number,
            kills: data.player.stats.kills,
            deaths: data.player.stats.deaths,
            assists: data.player.stats.assists,
            flashAssists: data.player.stats.flash_assists,
            headshots: data.player.stats.headshots,
            damage: data.player.stats.damage,
            rating: data.player.stats.rating,
            adr: data.player.stats.adr,
            kast: data.player.stats.kast,
          },
        })
        break
      }

      default:
        console.log('Unknown event type:', body.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
