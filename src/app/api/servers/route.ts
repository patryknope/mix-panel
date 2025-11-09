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

    const servers = await prisma.server.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { public: true },
        ],
      },
    })

    return NextResponse.json(servers)
  } catch (error) {
    console.error('Error fetching servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, ip, port, rconPassword, public: isPublic } = body

    // Validate required fields
    if (!name || !ip || !port || !rconPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if server with same IP:port already exists
    const existing = await prisma.server.findUnique({
      where: {
        ip_port: {
          ip,
          port,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Server with this IP and port already exists' },
        { status: 409 }
      )
    }

    // Create server
    const server = await prisma.server.create({
      data: {
        name,
        ip,
        port,
        rconPassword,
        public: isPublic || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(server, { status: 201 })
  } catch (error) {
    console.error('Error creating server:', error)
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}
