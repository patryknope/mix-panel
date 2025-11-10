import { Match, Team, TeamPlayer } from '@prisma/client'
import { Prisma } from '@prisma/client'

// Helper to safely convert Json to string array
function jsonToStringArray(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) {
    return json.filter((item): item is string => typeof item === 'string')
  }
  return []
}

export interface MatchConfig {
  matchid: string
  match_title: string
  clinch_series: boolean
  num_maps: number
  players_per_team: number
  coaches_per_team: number
  skip_veto: boolean
  side_type: string
  maplist: string[]
  map_sides?: string[]
  team1: TeamConfig
  team2: TeamConfig
  cvars: {
    get5_web_api_url: string
    get5_web_api_key: string
    [key: string]: any
  }
  spectators?: {
    name: string
    steamid: string
  }[]
}

export interface TeamConfig {
  name: string
  tag?: string
  flag?: string
  logo?: string
  players: {
    [steamId: string]: string // steamId: playerName
  }
  coaches?: {
    [steamId: string]: string
  }
}

export function generateMatchConfig(
  match: Match & {
    team1?: (Team & { players: (TeamPlayer & { user: { steamId: string; name: string } })[] }) | null
    team2?: (Team & { players: (TeamPlayer & { user: { steamId: string; name: string } })[] }) | null
  },
  apiUrl: string
): MatchConfig {
  const numMaps = match.series === 'BO1' ? 1 : match.series === 'BO2' ? 2 : match.series === 'BO3' ? 3 : 5

  // Handle Team 1
  let team1Players: { [key: string]: string } = {}
  let team1Coaches: { [key: string]: string } = {}
  let team1Config: TeamConfig

  if (match.team1) {
    match.team1.players.forEach(player => {
      if (player.coach) {
        team1Coaches[player.user.steamId] = player.user.name
      } else {
        team1Players[player.user.steamId] = player.user.name
      }
    })

    team1Config = {
      name: match.team1.name,
      tag: match.team1.tag || undefined,
      flag: match.team1.flag || undefined,
      logo: match.team1.logo || undefined,
      players: team1Players,
      coaches: Object.keys(team1Coaches).length > 0 ? team1Coaches : undefined,
    }
  } else {
    // Create placeholder team
    team1Config = {
      name: 'Team 1',
      players: {},
    }
  }

  // Handle Team 2
  let team2Players: { [key: string]: string } = {}
  let team2Coaches: { [key: string]: string } = {}
  let team2Config: TeamConfig

  if (match.team2) {
    match.team2.players.forEach(player => {
      if (player.coach) {
        team2Coaches[player.user.steamId] = player.user.name
      } else {
        team2Players[player.user.steamId] = player.user.name
      }
    })

    team2Config = {
      name: match.team2.name,
      tag: match.team2.tag || undefined,
      flag: match.team2.flag || undefined,
      logo: match.team2.logo || undefined,
      players: team2Players,
      coaches: Object.keys(team2Coaches).length > 0 ? team2Coaches : undefined,
    }
  } else {
    // Create placeholder team
    team2Config = {
      name: 'Team 2',
      players: {},
    }
  }

  return {
    matchid: match.id,
    match_title: match.team1 && match.team2 ? `${match.team1.name} vs ${match.team2.name}` : `Match ${match.id}`,
    clinch_series: true,
    num_maps: numMaps,
    players_per_team: 5,
    coaches_per_team: 1,
    skip_veto: false,
    side_type: match.knifeRound ? 'knife' : 'standard',
    maplist: jsonToStringArray(match.mapPool),
    team1: team1Config,
    team2: team2Config,
    cvars: {
      get5_web_api_url: apiUrl,
      get5_web_api_key: match.apiKey,
      mp_overtime_enable: match.overtime ? '1' : '0',
      mp_overtime_maxrounds: '6',
      mp_overtime_startmoney: '10000',
      get5_demo_name_format: `{MATCHID}_map{MAPNUMBER}_{MAPNAME}`,
      get5_print_damage: '1',
    },
  }
}

export function validateMatchConfig(config: MatchConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.matchid) {
    errors.push('Match ID is required')
  }

  if (!config.team1 || !config.team2) {
    errors.push('Both teams are required')
  }

  // Only validate players if teams have player data
  const hasPlayers = config.team1?.players && Object.keys(config.team1.players).length > 0
  if (!hasPlayers) {
    console.warn('Match has no player data - this is a veto-only match')
  }

  if (!config.maplist || config.maplist.length === 0) {
    errors.push('Map pool is required')
  }

  if (config.num_maps < 1 || config.num_maps > 5) {
    errors.push('Number of maps must be between 1 and 5')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
