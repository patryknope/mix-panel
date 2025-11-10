export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
  footer?: {
    text: string
  }
  timestamp?: string
}

export interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
}

export async function sendDiscordNotification(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending Discord notification:', error)
    return false
  }
}

export function createMatchStartEmbed(
  matchId: string,
  team1Name: string,
  team2Name: string,
  mapPool: string[]
): DiscordEmbed {
  return {
    title: '🏁 Match Started',
    description: `**${team1Name}** vs **${team2Name}**`,
    color: 0x00ff00, // Green
    fields: [
      {
        name: 'Match ID',
        value: matchId,
        inline: true,
      },
      {
        name: 'Map Pool',
        value: mapPool.join(', '),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

export function createMatchEndEmbed(
  matchId: string,
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number,
  winnerName: string
): DiscordEmbed {
  return {
    title: '🏆 Match Finished',
    description: `**${team1Name}** ${team1Score} - ${team2Score} **${team2Name}**`,
    color: 0x0099ff, // Blue
    fields: [
      {
        name: 'Match ID',
        value: matchId,
        inline: true,
      },
      {
        name: 'Winner',
        value: winnerName,
        inline: true,
      },
      {
        name: 'Final Score',
        value: `${team1Score} - ${team2Score}`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

export function createMapEndEmbed(
  matchId: string,
  mapName: string,
  mapNumber: number,
  team1Name: string,
  team2Name: string,
  team1Score: number,
  team2Score: number,
  winnerName: string
): DiscordEmbed {
  return {
    title: `📍 Map ${mapNumber} Finished`,
    description: `**${mapName}**`,
    color: 0xffaa00, // Orange
    fields: [
      {
        name: 'Match ID',
        value: matchId,
        inline: true,
      },
      {
        name: 'Winner',
        value: winnerName,
        inline: true,
      },
      {
        name: 'Score',
        value: `${team1Name} ${team1Score} - ${team2Score} ${team2Name}`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}

export function createQuickVetoStartEmbed(matchId: string, mapPool: string[]): DiscordEmbed {
  return {
    title: '⚡ Quick Veto Started',
    description: 'A new veto session has started',
    color: 0xffff00, // Yellow
    fields: [
      {
        name: 'Match ID',
        value: matchId,
        inline: true,
      },
      {
        name: 'Map Pool',
        value: mapPool.join(', '),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  }
}
