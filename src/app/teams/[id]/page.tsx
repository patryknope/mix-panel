import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Users, Trophy, Calendar } from 'lucide-react'

async function getTeam(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      creator: true,
      players: {
        include: {
          user: true,
        },
      },
      matchesAsTeam1: {
        include: {
          team2: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      matchesAsTeam2: {
        include: {
          team1: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  })

  return team
}

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const team = await getTeam(params.id)

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Team not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const allMatches = [...team.matchesAsTeam1, ...team.matchesAsTeam2].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const wins = allMatches.filter((match) => match.winner === team.id).length
  const losses = allMatches.filter(
    (match) => match.winner && match.winner !== team.id
  ).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/teams">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {team.logo && (
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {team.name}
                  {team.tag && (
                    <span className="text-2xl text-muted-foreground">
                      [{team.tag}]
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Created by {team.creator.name} •{' '}
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {team.flag && (
              <span className="text-4xl">{team.flag}</span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roster
              </CardTitle>
              <CardDescription>
                {team.players.length} player{team.players.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.players.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No players yet
                </p>
              ) : (
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {player.user.avatar && (
                          <img
                            src={player.user.avatar}
                            alt={player.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{player.user.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {player.user.steamId}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {player.captain && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                            Captain
                          </span>
                        )}
                        {player.coach && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                            Coach
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Statistics
              </CardTitle>
              <CardDescription>Team performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold">{allMatches.length}</p>
                    <p className="text-sm text-muted-foreground">Matches</p>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300">
                      {wins}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">Wins</p>
                  </div>
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <p className="text-3xl font-bold text-red-800 dark:text-red-300">
                      {losses}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">Losses</p>
                  </div>
                </div>
                {allMatches.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{
                            width: `${(wins / allMatches.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((wins / allMatches.length) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Matches
            </CardTitle>
            <CardDescription>Last 10 matches</CardDescription>
          </CardHeader>
          <CardContent>
            {allMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No matches played yet
              </p>
            ) : (
              <div className="space-y-3">
                {allMatches.map((match) => {
                  const isTeam1 = match.team1Id === team.id
                  const opponent = isTeam1
                    ? ('team2' in match ? match.team2 : null)
                    : ('team1' in match ? match.team1 : null)
                  const teamScore = isTeam1 ? match.team1Score : match.team2Score
                  const opponentScore = isTeam1 ? match.team2Score : match.team1Score
                  const isWinner = match.winner === team.id

                  return (
                    <Link key={match.id} href={`/matches/${match.id}`}>
                      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-2 h-12 rounded ${
                              match.status === 'FINISHED'
                                ? isWinner
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                                : match.status === 'LIVE'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <div>
                            <p className="font-medium">
                              vs {opponent?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(match.createdAt).toLocaleDateString()} •{' '}
                              {match.series}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {match.status === 'FINISHED' ? (
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {teamScore} - {opponentScore}
                              </p>
                              <p
                                className={`text-sm ${
                                  isWinner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {isWinner ? 'Victory' : 'Defeat'}
                              </p>
                            </div>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded text-sm ${
                                match.status === 'LIVE'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}
                            >
                              {match.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
