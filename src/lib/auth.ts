import { NextAuthOptions } from 'next-auth'
import prisma from './prisma'
import axios from 'axios'

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
    {
      id: 'steam',
      name: 'Steam',
      type: 'oauth',
      authorization: {
        url: 'https://steamcommunity.com/openid/login',
        params: {
          'openid.mode': 'checkid_setup',
          'openid.ns': 'http://specs.openid.net/auth/2.0',
          'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        },
      },
      token: {
        async request(context: any) {
          // Steam uses OpenID, doesn't need token exchange
          const params = new URLSearchParams(context.params)

          // Validate Steam OpenID response
          const claimedId = params.get('openid.claimed_id')
          if (!claimedId) {
            throw new Error('No claimed_id in response')
          }

          // Extract Steam ID from claimed_id URL
          const steamIdMatch = claimedId.match(/(\d+)$/)
          if (!steamIdMatch) {
            throw new Error('Invalid Steam ID')
          }

          return {
            tokens: {
              steamId: steamIdMatch[1],
            },
          }
        },
      },
      userinfo: {
        async request(context: any) {
          const steamId = context.tokens.steamId

          // Fetch user info from Steam API
          try {
            const response = await axios.get(
              `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`,
              {
                params: {
                  key: process.env.STEAM_API_KEY,
                  steamids: steamId,
                },
              }
            )

            const player = response.data.response.players[0]
            if (!player) {
              throw new Error('Player not found')
            }

            return {
              id: steamId,
              name: player.personaname,
              image: player.avatarfull,
              steamId: steamId,
            }
          } catch (error) {
            console.error('Error fetching Steam profile:', error)
            throw error
          }
        },
      },
      profile(profile: any) {
        return {
          id: profile.steamId,
          steamId: profile.steamId,
          name: profile.name,
          avatar: profile.image,
          role: 'USER',
        }
      },
      checks: ['none'],
      clientId: 'not-needed',
      clientSecret: 'not-needed',
    },
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
