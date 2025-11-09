import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { encode } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const steamId = searchParams.get('steamId')
  const name = searchParams.get('name')
  const avatar = searchParams.get('avatar')

  if (!steamId || !name) {
    return NextResponse.redirect(new URL('/?error=missing_data', req.url))
  }

  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { steamId },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          steamId,
          name,
          avatar,
          role: 'USER',
        },
      })
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { steamId },
        data: {
          name,
          avatar,
        },
      })
    }

    // Create NextAuth session token
    const token = await encode({
      token: {
        sub: user.steamId,
        name: user.name,
        picture: user.avatar,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Redirect to home with session cookie
    const response = NextResponse.redirect(new URL('/', req.url))

    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    // Also set the __Secure version for production
    if (process.env.NODE_ENV === 'production') {
      response.cookies.set('__Secure-next-auth.session-token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response

  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.redirect(new URL('/?error=database_error', req.url))
  }
}
