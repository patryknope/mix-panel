'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Player {
  id: string
  steamId: string
  name: string
  captain: boolean
  coach: boolean
}

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [team, setTeam] = useState<any>(null)
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [flag, setFlag] = useState('')
  const [logo, setLogo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState({ steamId: '', name: '' })

  useEffect(() => {
    fetchTeam()
  }, [params.id])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
        setName(data.name)
        setTag(data.tag || '')
        setFlag(data.flag || '')
        setLogo(data.logo || '')
        setIsPublic(data.public)
        setPlayers(
          data.players.map((p: any) => ({
            id: p.id,
            steamId: p.user.steamId,
            name: p.user.name,
            captain: p.captain,
            coach: p.coach,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching team:', error)
      toast.error('Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = () => {
    if (newPlayer.steamId && newPlayer.name) {
      setPlayers([
        ...players,
        {
          id: '',
          steamId: newPlayer.steamId,
          name: newPlayer.name,
          captain: false,
          coach: false,
        },
      ])
      setNewPlayer({ steamId: '', name: '' })
    }
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const toggleCaptain = (index: number) => {
    const updated = [...players]
    updated[index].captain = !updated[index].captain
    setPlayers(updated)
  }

  const toggleCoach = (index: number) => {
    const updated = [...players]
    updated[index].coach = !updated[index].coach
    setPlayers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/teams/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tag,
          flag,
          logo,
          public: isPublic,
          players: players.map((p) => ({
            steamId: p.steamId,
            name: p.name,
            captain: p.captain,
            coach: p.coach,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      toast.success('Team updated successfully')
      router.push(`/teams/${params.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update team')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Please sign in to edit teams</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!team || team.creatorId !== session.user.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Team not found or you don't have permission to edit it</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href={`/teams/${params.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Team</h1>
          <p className="text-muted-foreground">Update team information and roster</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Basic details about your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Team Liquid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Team Tag</Label>
                <Input
                  id="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="TL"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag">Flag (emoji)</Label>
                <Input
                  id="flag"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="🇺🇸"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="public" className="cursor-pointer">
                  Make team public (visible to all users)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Roster
              </CardTitle>
              <CardDescription>Add players using their Steam ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {player.steamId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={player.captain ? 'default' : 'outline'}
                        onClick={() => toggleCaptain(index)}
                      >
                        Captain
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={player.coach ? 'default' : 'outline'}
                        onClick={() => toggleCoach(index)}
                      >
                        Coach
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePlayer(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {players.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No players added yet
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Add Player</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Steam ID"
                    value={newPlayer.steamId}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, steamId: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Player Name"
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, name: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddPlayer}
                  className="mt-3 w-full"
                  variant="outline"
                >
                  Add Player
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/teams/${params.id}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
