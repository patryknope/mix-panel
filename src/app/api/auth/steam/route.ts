import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  // Check if this is a callback from Steam
  const mode = searchParams.get('openid.mode')

  if (mode === 'id_res') {
    // This is the callback from Steam
    const claimedId = searchParams.get('openid.claimed_id')

    if (!claimedId) {
      return NextResponse.redirect(new URL('/?error=no_claimed_id', req.url))
    }

    // Extract Steam ID
    const steamIdMatch = claimedId.match(/(\d+)$/)
    if (!steamIdMatch) {
      return NextResponse.redirect(new URL('/?error=invalid_steam_id', req.url))
    }

    const steamId = steamIdMatch[1]

    // Verify the OpenID response with Steam
    const verifyParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      verifyParams.append(key, value)
    })
    verifyParams.set('openid.mode', 'check_authentication')

    try {
      const verifyResponse = await axios.post(
        'https://steamcommunity.com/openid/login',
        verifyParams.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      if (!verifyResponse.data.includes('is_valid:true')) {
        return NextResponse.redirect(new URL('/?error=invalid_signature', req.url))
      }

      // Get Steam user info
      let player
      try {
        const playerResponse = await axios.get(
          'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
          {
            params: {
              key: process.env.STEAM_API_KEY,
              steamids: steamId,
            },
          }
        )

        player = playerResponse.data.response.players[0]
      } catch (apiError: any) {
        console.error('Steam API error:', apiError.response?.data || apiError.message)
        // Continue without player data if API fails
        player = {
          personaname: `Player_${steamId.slice(-4)}`,
          avatarfull: '',
        }
      }

      if (!player) {
        return NextResponse.redirect(new URL('/?error=player_not_found', req.url))
      }

      // Store user data in session or redirect to NextAuth callback
      // For now, redirect to a success page with Steam ID
      const callbackUrl = new URL('/api/auth/callback/steam-custom', req.url)
      callbackUrl.searchParams.set('steamId', steamId)
      callbackUrl.searchParams.set('name', player.personaname)
      callbackUrl.searchParams.set('avatar', player.avatarfull)

      return NextResponse.redirect(callbackUrl)

    } catch (error) {
      console.error('Steam verification error:', error)
      return NextResponse.redirect(new URL('/?error=verification_failed', req.url))
    }

  } else {
    // Initiate Steam OpenID login
    const returnTo = `${process.env.NEXTAUTH_URL}/api/auth/steam`
    const realm = process.env.NEXTAUTH_URL

    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo!,
      'openid.realm': realm!,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    })

    return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`)
  }
}
