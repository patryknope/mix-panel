'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function CreateTeamPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Array<{ steamId: string; name: string }>>([])
  const [newPlayer, setNewPlayer] = useState({ steamId: '', name: '' })

  const handleAddPlayer = () => {
    if (newPlayer.steamId && newPlayer.name) {
      setPlayers([...players, newPlayer])
      setNewPlayer({ steamId: '', name: '' })
    }
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      tag: formData.get('tag') as string,
      flag: formData.get('flag') as string,
      logo: formData.get('logo') as string,
      public: formData.get('public') === 'on',
      players,
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const result = await response.json()
      router.push(`/teams/${result.id}`)
    } catch (error) {
      console.error(error)
      alert('Failed to create team')
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
              <p>Please sign in to create a team</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create Team</h1>
          <p className="text-muted-foreground">
            Add a new team and configure the roster
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Basic information about the team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Team Awesome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  name="tag"
                  placeholder="TMA"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag">Country Code</Label>
                <Input
                  id="flag"
                  name="flag"
                  placeholder="US"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  2-letter country code (e.g., US, UK, PL)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  name="public"
                  className="h-4 w-4"
                />
                <Label htmlFor="public" className="cursor-pointer">
                  Make team public (visible to all users)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>
                Add players to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary rounded">
                    <div className="flex-1">
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.steamId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlayer(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Steam ID</Label>
                  <Input
                    value={newPlayer.steamId}
                    onChange={(e) => setNewPlayer({ ...newPlayer, steamId: e.target.value })}
                    placeholder="76561198000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Player Name</Label>
                  <Input
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    placeholder="Player Name"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPlayer}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Player
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
            <Link href="/teams" className="flex-1">
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
