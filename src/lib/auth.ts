import {NextAuthOptions} from 'next-auth'
import prisma from './prisma'
import axios from "axios";

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
            wellKnown: undefined,
            authorization: {
                url: 'https://steamcommunity.com/openid/login',
                params: {
                    'openid.ns': 'http://specs.openid.net/auth/2.0',
                    'openid.mode': 'checkid_setup',
                    'openid.return_to': `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
                    'openid.realm': process.env.NEXTAUTH_URL,
                    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
                    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
                },
            },
            token: {
                async request(context: any) {
                    // Steam returns data via query params on the callback, not in the typical OAuth flow
                    const {query} = context.provider.callbackUrl ?
                        {query: context.provider.callbackUrl} :
                        {query: context.params}

                    // Get claimed_id from either query or params
                    let claimedId
                    if (typeof query === 'string') {
                        const urlParams = new URL(query).searchParams
                        claimedId = urlParams.get('openid.claimed_id')
                    } else {
                        claimedId = query?.['openid.claimed_id'] || context.params?.['openid.claimed_id']
                    }

                    console.log('Token request - claimedId:', claimedId)
                    console.log('Token request - full context:', JSON.stringify(context, null, 2))

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
            client: {
                token_endpoint_auth_method: 'none',
            },
            clientId: 'steam',
            clientSecret: 'steam',
        } as any,
    ],
    callbacks: {
        async signIn({user, account}: any) {
            if (account?.provider === 'steam') {
                try {
                    const steamId = user.steamId || user.id

                    if (!steamId) {
                        console.error('No Steam ID found:', user)
                        return false
                    }

                    console.log('Steam login attempt for:', steamId, user)

                    // Check if user exists
                    const existingUser = await prisma.user.findUnique({
                        where: {steamId: String(steamId)},
                    })

                    if (!existingUser) {
                        // Create new user
                        await prisma.user.create({
                            data: {
                                steamId: String(steamId),
                                name: user.name || 'Steam User',
                                avatar: user.avatar,
                                role: 'USER',
                            },
                        })
                        console.log('Created new user:', steamId)
                    } else {
                        // Update existing user
                        await prisma.user.update({
                            where: {steamId: String(steamId)},
                            data: {
                                name: user.name || existingUser.name,
                                avatar: user.avatar || existingUser.avatar,
                            },
                        })
                        console.log('Updated existing user:', steamId)
                    }

                    return true
                } catch (error) {
                    console.error('Error during sign in:', error)
                    return false
                }
            }
            return true
        },
        async session({session, token}: any) {
            if (token?.sub) {
                const user = await prisma.user.findUnique({
                    where: {steamId: token.sub},
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
        async jwt({token, user, profile}: any) {
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
