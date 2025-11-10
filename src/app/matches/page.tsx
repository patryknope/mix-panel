import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Trophy, Circle } from 'lucide-react'
import { Prisma } from '@prisma/client'

function jsonToStringArray(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) {
    return json.filter((item): item is string => typeof item === 'string')
  }
  return []
}

async function getMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      team1: true,
      team2: true,
      server: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return matches
}

export default async function MatchesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const matches = await getMatches(session.user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'fill-green-500 text-green-500'
      case 'FINISHED':
        return 'fill-gray-500 text-gray-500'
      case 'CANCELED':
        return 'fill-red-500 text-red-500'
      default:
        return 'fill-yellow-500 text-yellow-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Matches</h1>
            <p className="text-muted-foreground">
              View and manage your CS2 matches
            </p>
          </div>
          <Link href="/matches/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Match
            </Button>
          </Link>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first match to get started
              </p>
              <Link href="/matches/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Match
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const mapPool = jsonToStringArray(match.mapPool)
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Circle className={`h-3 w-3 ${getStatusColor(match.status)}`} />
                          <span className="text-lg">
                            {match.team1 && match.team2
                              ? `${match.team1.name} vs ${match.team2.name}`
                              : `Quick Veto - ${match.id.slice(0, 8)}`
                            }
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm px-2 py-1 rounded ${
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
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {match.series}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold">
                            {match.team1Score} - {match.team2Score}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Server</p>
                          <p className="text-sm font-medium">
                            {match.server ? match.server.name : 'Not assigned'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Map Pool</p>
                          <p className="text-sm">
                            {mapPool.length} map(s): {mapPool.slice(0, 3).map(m => m.replace('de_', '')).join(', ')}
                            {mapPool.length > 3 && '...'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created {new Date(match.createdAt).toLocaleDateString()}
                        </span>
                        {match.startedAt && (
                          <span>
                            Started {new Date(match.startedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
