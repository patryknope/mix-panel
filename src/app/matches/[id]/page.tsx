import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Copy, Trophy, Server, Circle } from 'lucide-react'
import { Prisma } from '@prisma/client'

function jsonToStringArray(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) {
    return json.filter((item): item is string => typeof item === 'string')
  }
  return []
}

async function getMatch(matchId: string, userId: string) {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      creatorId: userId,
    },
    include: {
      team1: {
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      },
      team2: {
        include: {
          players: {
            include: {
              user: true,
            },
          },
        },
      },
      server: true,
      mapStats: {
        orderBy: {
          mapNumber: 'asc',
        },
      },
      playerStats: true,
    },
  })

  return match
}

export default async function MatchDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const match = await getMatch(params.id, session.user.id)

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Match not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const mapPool = jsonToStringArray(match.mapPool)
  const configUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/match/${match.id}/config`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'text-green-500 fill-green-500'
      case 'FINISHED':
        return 'text-gray-500 fill-gray-500'
      case 'CANCELED':
        return 'text-red-500 fill-red-500'
      default:
        return 'text-yellow-500 fill-yellow-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Circle className={`h-4 w-4 ${getStatusColor(match.status)}`} />
                {match.team1 && match.team2
                  ? `${match.team1.name} vs ${match.team2.name}`
                  : `Quick Veto - Match ${match.id.slice(0, 8)}`
                }
              </h1>
              <p className="text-muted-foreground mt-1">
                {match.series} Match • Created {new Date(match.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              match.status === 'LIVE'
                ? 'bg-green-100 text-green-800'
                : match.status === 'FINISHED'
                ? 'bg-gray-100 text-gray-800'
                : match.status === 'CANCELED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {match.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {match.team1 && match.team2 ? (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">{match.team1.name}</p>
                      <p className="text-5xl font-bold">{match.team1Score}</p>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">{match.team2.name}</p>
                      <p className="text-5xl font-bold">{match.team2Score}</p>
                    </div>
                  </div>
                  {match.winner && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Winner</p>
                      <p className="text-lg font-semibold">
                        {match.winner === match.team1Id ? match.team1.name : match.team2.name}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Quick veto mode - No team scores tracked</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Server Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.server ? (
                <div>
                  <p className="text-sm text-muted-foreground">Server</p>
                  <p className="font-medium">{match.server.name}</p>
                  <p className="text-sm font-mono">
                    {match.server.ip}:{match.server.port}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No server assigned</p>
              )}

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">MatchZy Config URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={configUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-secondary rounded text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(configUrl)
                      alert('Config URL copied!')
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use: <code className="bg-secondary px-1 rounded">get5_loadmatch_url "{configUrl}"</code>
                </p>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">API Key</p>
                <p className="text-xs font-mono bg-secondary px-2 py-1 rounded break-all">
                  {match.apiKey}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Match Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">{match.series}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Knife Round</p>
                <p className="font-medium">{match.knifeRound ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overtime</p>
                <p className="font-medium">{match.overtime ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Map Pool</p>
                <p className="font-medium">{mapPool.length} maps</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Maps</p>
              <div className="flex flex-wrap gap-2">
                {mapPool.map((map) => (
                  <span key={map} className="bg-secondary px-3 py-1 rounded text-sm">
                    {map.replace('de_', '')}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {match.mapStats.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Map Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {match.mapStats.map((mapStat) => (
                  <div key={mapStat.id} className="flex items-center justify-between p-3 bg-secondary rounded">
                    <div>
                      <p className="font-medium">{mapStat.mapName}</p>
                      <p className="text-sm text-muted-foreground">Map {mapStat.mapNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {mapStat.team1Score} - {mapStat.team2Score}
                      </p>
                      {mapStat.winner && match.team1 && match.team2 && (
                        <p className="text-sm text-muted-foreground">
                          {mapStat.winner === match.team1Id ? match.team1.name : match.team2.name} won
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
