import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateMatchConfig } from '@/lib/match-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { matchid: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: params.matchid },
      include: {
        team1: {
          include: {
            players: {
              include: {
                user: true,
              },
            },
          },
        },
        team2: {
          include: {
            players: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Generate the match configuration in Get5 format
    const apiUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const webhookUrl = `${apiUrl}/api/match/${match.id}/webhook`
    
    const config = generateMatchConfig(match, webhookUrl)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error serving match config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
