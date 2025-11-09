import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const matches = await prisma.match.findMany({
      where: {
        creatorId: session.user.id,
      },
      include: {
        team1: true,
        team2: true,
        server: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      team1Id,
      team2Id,
      serverId,
      series,
      mapPool,
      knifeRound,
      overtime,
    } = body

    // Validate required fields
    if (!team1Id || !team2Id) {
      return NextResponse.json({ error: 'Both teams are required' }, { status: 400 })
    }

    if (team1Id === team2Id) {
      return NextResponse.json({ error: 'Teams must be different' }, { status: 400 })
    }

    if (!mapPool || mapPool.length === 0) {
      return NextResponse.json({ error: 'At least one map is required' }, { status: 400 })
    }

    // Generate unique API key for this match
    const apiKey = `match_${crypto.randomBytes(32).toString('hex')}`

    // Mark server as in use if selected
    if (serverId) {
      await prisma.server.update({
        where: { id: serverId },
        data: { inUse: true },
      })
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        team1Id,
        team2Id,
        serverId: serverId || null,
        creatorId: session.user.id,
        series: series || 'BO1',
        apiKey,
        mapPool: JSON.stringify(mapPool),
        mapBans: JSON.stringify([]),
        mapPicks: JSON.stringify([]),
        knifeRound: knifeRound !== undefined ? knifeRound : true,
        overtime: overtime !== undefined ? overtime : true,
      },
      include: {
        team1: true,
        team2: true,
        server: true,
      },
    })

    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}
