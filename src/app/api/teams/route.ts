import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { public: true },
        ],
      },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, tag, flag, logo, public: isPublic, players } = body

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        tag: tag || null,
        flag: flag || null,
        logo: logo || null,
        public: isPublic || false,
        creatorId: session.user.id,
      },
    })

    // Add players if provided
    if (players && Array.isArray(players) && players.length > 0) {
      for (const player of players) {
        // Check if user exists, if not create them
        let user = await prisma.user.findUnique({
          where: { steamId: player.steamId },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              steamId: player.steamId,
              name: player.name,
              role: 'USER',
            },
          })
        }

        // Add player to team
        await prisma.teamPlayer.create({
          data: {
            teamId: team.id,
            userId: user.id,
            captain: false,
            coach: false,
          },
        })
      }
    }

    // Fetch the complete team with players
    const completeTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(completeTeam, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}
