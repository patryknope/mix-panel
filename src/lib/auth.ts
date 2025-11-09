import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from './prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      steamId: string
      name: string
      avatar?: string | null
      role: string
    }
  }
  interface User {
    id: string
    steamId: string
    name: string
    avatar?: string | null
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'steam',
      name: 'Steam',
      type: 'oauth',
      authorization: {
        url: 'https://steamcommunity.com/openid/login',
        params: {
          'openid.ns': 'http://specs.openid.net/auth/2.0',
          'openid.mode': 'checkid_setup',
          'openid.return_to': process.env.STEAM_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/steam',
          'openid.realm': process.env.NEXTAUTH_URL || 'http://localhost:3000',
          'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        },
      },
      idToken: true,
      checks: ['none'],
      clientId: 'none',
      clientSecret: 'none',
      profile(profile: any) {
        return {
          id: profile.steamid,
          steamId: profile.steamid,
          name: profile.personaname,
          avatar: profile.avatarfull,
          role: 'USER',
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'steam') {
        try {
          // Extract Steam ID from the identity URL
          const steamId = account.id || user.id
          
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { steamId },
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                steamId,
                name: user.name || 'Unknown',
                avatar: user.avatar,
                role: 'USER',
              },
            })
          } else {
            // Update existing user
            await prisma.user.update({
              where: { steamId },
              data: {
                name: user.name || existingUser.name,
                avatar: user.avatar || existingUser.avatar,
              },
            })
          }

          return true
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }: any) {
      if (token?.sub) {
        const user = await prisma.user.findUnique({
          where: { steamId: token.sub },
        })
        
        if (user) {
          session.user = {
            id: user.id,
            steamId: user.steamId,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
          }
        }
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.steamId
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
