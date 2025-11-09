import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import SteamProvider from 'next-auth-steam'
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
  providers: [
    SteamProvider(process.env.NEXTAUTH_URL || 'http://localhost:3000', process.env.STEAM_API_KEY!),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'steam') {
        try {
          // Extract Steam ID - next-auth-steam provides it in user.id
          const steamId = user.id || profile?.steamid || profile?.id

          if (!steamId) {
            console.error('No Steam ID found in user profile')
            return false
          }

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { steamId: String(steamId) },
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                steamId: String(steamId),
                name: user.name || profile?.personaname || 'Steam User',
                avatar: user.image || profile?.avatarfull || profile?.avatar,
                role: 'USER',
              },
            })
          } else {
            // Update existing user
            await prisma.user.update({
              where: { steamId: String(steamId) },
              data: {
                name: user.name || profile?.personaname || existingUser.name,
                avatar: user.image || profile?.avatarfull || profile?.avatar || existingUser.avatar,
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
    async jwt({ token, user, profile }: any) {
      if (user) {
        // Store Steam ID in token.sub
        token.sub = user.id || user.steamId || profile?.steamid
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
