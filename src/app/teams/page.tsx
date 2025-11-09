import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Users, Edit } from 'lucide-react'

async function getTeams(userId: string) {
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { public: true },
      ],
    },
    include: {
      creator: true,
      players: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          players: true,
          matchesAsTeam1: true,
          matchesAsTeam2: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return teams
}

export default async function TeamsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const teams = await getTeams(session.user.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              Manage your teams and rosters
            </p>
          </div>
          <Link href="/teams/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </Link>
        </div>

        {teams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first team to get started
              </p>
              <Link href="/teams/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {team.logo && (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-8 w-8 rounded"
                          />
                        )}
                        <span>{team.name}</span>
                        {team.tag && (
                          <span className="text-sm text-muted-foreground">
                            [{team.tag}]
                          </span>
                        )}
                      </CardTitle>
                      {team.flag && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.flag}
                        </p>
                      )}
                    </div>
                    {team.creatorId === session.user.id && (
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-medium">{team._count.players}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Matches:</span>
                      <span className="font-medium">
                        {team._count.matchesAsTeam1 + team._count.matchesAsTeam2}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium text-xs">
                        {team.creator.name}
                      </span>
                    </div>
                    {team.public && (
                      <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>

                  {team.players.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Roster:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {team.players.slice(0, 5).map((player) => (
                          <div
                            key={player.id}
                            className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1"
                          >
                            <img
                              src={player.user.avatar || ''}
                              alt={player.user.name}
                              className="h-4 w-4 rounded-full"
                            />
                            {player.user.name}
                            {player.captain && <span className="text-yellow-500">★</span>}
                          </div>
                        ))}
                        {team.players.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{team.players.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
