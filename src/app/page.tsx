import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Server, Activity } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function getStats(userId?: string) {
  if (!userId) {
    return {
      totalMatches: 0,
      liveMatches: 0,
      totalTeams: 0,
      totalServers: 0,
    }
  }

  const [totalMatches, liveMatches, totalTeams, totalServers] = await Promise.all([
    prisma.match.count({
      where: { creatorId: userId },
    }),
    prisma.match.count({
      where: { 
        creatorId: userId,
        status: 'LIVE',
      },
    }),
    prisma.team.count({
      where: { creatorId: userId },
    }),
    prisma.server.count({
      where: { userId },
    }),
  ])

  return {
    totalMatches,
    liveMatches,
    totalTeams,
    totalServers,
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const stats = await getStats(session?.user?.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your CS2 Match Management Panel
          </p>
        </div>

        {session ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Matches
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    All time matches created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Live Matches
                  </CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.liveMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Teams
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTeams}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered teams
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Servers
                  </CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalServers}</div>
                  <p className="text-xs text-muted-foreground">
                    Connected servers
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href="/matches/create"
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Create Match</p>
                        <p className="text-sm text-muted-foreground">
                          Start a new competitive match
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/teams/create"
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Create Team</p>
                        <p className="text-sm text-muted-foreground">
                          Register a new team
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/servers/add"
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center space-x-3">
                      <Server className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Add Server</p>
                        <p className="text-sm text-muted-foreground">
                          Connect a new game server
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest matches and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No recent activity to display
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Welcome to Get5 Panel</CardTitle>
              <CardDescription>
                Please sign in with Steam to access the panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This panel allows you to manage CS2 matches with MatchZy integration.
                Sign in to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Create and manage matches</li>
                <li>Set up teams and players</li>
                <li>Configure game servers</li>
                <li>View match statistics</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
