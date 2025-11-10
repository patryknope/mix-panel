'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Team {
  id: string
  name: string
  tag?: string
  logo?: string
}

interface Server {
  id: string
  name: string
  ip: string
  port: number
  inUse: boolean
}

const CS2_MAPS = [
  'de_ancient',
  'de_anubis',
  'de_dust2',
  'de_inferno',
  'de_mirage',
  'de_nuke',
  'de_vertigo',
]

type MatchMode = 'quick-veto' | 'with-teams'

export default function CreateMatchPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mode, setMode] = useState<MatchMode | null>(null)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [selectedTeam1, setSelectedTeam1] = useState('')
  const [selectedTeam2, setSelectedTeam2] = useState('')
  const [selectedServer, setSelectedServer] = useState('')
  const [series, setSeries] = useState<'BO1' | 'BO2' | 'BO3' | 'BO5'>('BO1')
  const [mapPool, setMapPool] = useState<string[]>(CS2_MAPS)
  const [knifeRound, setKnifeRound] = useState(true)
  const [overtime, setOvertime] = useState(true)
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'with-teams') {
      fetchTeamsAndServers()
    } else if (mode === 'quick-veto') {
      fetchServers()
    }
  }, [mode])

  const fetchTeamsAndServers = async () => {
    try {
      const [teamsRes, serversRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/servers'),
      ])

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData)
      }

      if (serversRes.ok) {
        const serversData = await serversRes.json()
        setServers(serversData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchServers = async () => {
    try {
      const serversRes = await fetch('/api/servers')
      if (serversRes.ok) {
        const serversData = await serversRes.json()
        setServers(serversData)
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }

  const toggleMap = (map: string) => {
    if (mapPool.includes(map)) {
      setMapPool(mapPool.filter((m) => m !== map))
    } else {
      setMapPool([...mapPool, map])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'with-teams') {
      if (!selectedTeam1 || !selectedTeam2) {
        setError('Please select both teams')
        setLoading(false)
        return
      }

      if (selectedTeam1 === selectedTeam2) {
        setError('Teams must be different')
        setLoading(false)
        return
      }
    }

    if (mapPool.length === 0) {
      setError('Please select at least one map')
      setLoading(false)
      return
    }

    const data = {
      team1Id: mode === 'with-teams' ? selectedTeam1 : null,
      team2Id: mode === 'with-teams' ? selectedTeam2 : null,
      serverId: selectedServer || null,
      series,
      mapPool,
      knifeRound,
      overtime,
      discordWebhook: discordWebhook || null,
    }

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create match')
      }

      const result = await response.json()
      router.push(`/matches/${result.id}`)
    } catch (error: any) {
      console.error(error)
      setError(error.message || 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Please sign in to create a match</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Matches
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Create Match</h1>
            <p className="text-muted-foreground">
              Choose how you want to set up your match
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMode('quick-veto')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <CardTitle>Quick Veto</CardTitle>
                </div>
                <CardDescription>
                  Create a map veto without defining teams. Perfect for quick scrims or
                  pugs where you just need to pick/ban maps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No team setup required</li>
                  <li>• Fast map veto process</li>
                  <li>• Can add teams later</li>
                  <li>• Great for casual matches</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMode('with-teams')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Trophy className="h-8 w-8 text-blue-500" />
                  <CardTitle>Match with Teams</CardTitle>
                </div>
                <CardDescription>
                  Full match setup with team selection, player tracking, and complete
                  statistics. Best for competitive matches.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Full team management</li>
                  <li>• Player statistics tracking</li>
                  <li>• Match history</li>
                  <li>• Complete configuration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Match creation form
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setMode(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mode Selection
          </Button>
          <h1 className="text-3xl font-bold">
            {mode === 'quick-veto' ? 'Quick Veto Setup' : 'Create Match'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'quick-veto'
              ? 'Configure your map pool and veto settings'
              : 'Set up a new competitive CS2 match'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'with-teams' && (
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Select the competing teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Team 1</Label>
                  <select
                    value={selectedTeam1}
                    onChange={(e) => setSelectedTeam1(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.tag && `[${team.tag}]`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center text-2xl font-bold text-muted-foreground">
                  VS
                </div>

                <div className="space-y-2">
                  <Label>Team 2</Label>
                  <select
                    value={selectedTeam2}
                    onChange={(e) => setSelectedTeam2(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.tag && `[${team.tag}]`}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Server</CardTitle>
              <CardDescription>Choose a game server (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">No server (configure later)</option>
                {servers
                  .filter((s) => !s.inUse)
                  .map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} ({server.ip}:{server.port})
                    </option>
                  ))}
              </select>
              {servers.filter((s) => !s.inUse).length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No available servers.{' '}
                  <Link href="/servers/add" className="underline">
                    Add a server
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Format</CardTitle>
              <CardDescription>Series type and map pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Series Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BO1', 'BO2', 'BO3', 'BO5'] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={series === type ? 'default' : 'outline'}
                      onClick={() => setSeries(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Map Pool</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CS2_MAPS.map((map) => (
                    <Button
                      key={map}
                      type="button"
                      variant={mapPool.includes(map) ? 'default' : 'outline'}
                      onClick={() => toggleMap(map)}
                      className="justify-start"
                    >
                      {map.replace('de_', '')}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {mapPool.length} map(s)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Settings</CardTitle>
              <CardDescription>Additional configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="knifeRound"
                  checked={knifeRound}
                  onChange={(e) => setKnifeRound(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="knifeRound" className="cursor-pointer">
                  Enable knife round for side selection
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overtime"
                  checked={overtime}
                  onChange={(e) => setOvertime(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="overtime" className="cursor-pointer">
                  Enable overtime (MR6)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordWebhook">Discord Webhook URL (Optional)</Label>
                <input
                  type="url"
                  id="discordWebhook"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full p-2 border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Receive match updates in your Discord server
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Trophy className="mr-2 h-4 w-4" />
              {loading ? 'Creating...' : mode === 'quick-veto' ? 'Create Veto' : 'Create Match'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setMode(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
