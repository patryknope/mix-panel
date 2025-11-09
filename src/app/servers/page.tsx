import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Server as ServerIcon, Circle } from 'lucide-react'

async function getServers(userId: string) {
  const servers = await prisma.server.findMany({
    where: {
      OR: [
        { userId },
        { public: true },
      ],
    },
    include: {
      user: true,
      _count: {
        select: {
          matches: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return servers
}

export default async function ServersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  const servers = await getServers(session.user.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Servers</h1>
            <p className="text-muted-foreground">
              Manage your CS2 game servers
            </p>
          </div>
          <Link href="/servers/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </Link>
        </div>

        {servers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ServerIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No servers yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first game server to get started
              </p>
              <Link href="/servers/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Server
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <Card key={server.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ServerIcon className="h-5 w-5" />
                      {server.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Circle
                        className={`h-3 w-3 ${server.inUse ? 'fill-red-500 text-red-500' : 'fill-green-500 text-green-500'}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {server.inUse ? 'In Use' : 'Available'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-mono font-medium">
                        {server.ip}:{server.port}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Matches:</span>
                      <span className="font-medium">{server._count.matches}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium text-xs">
                        {server.user.name}
                      </span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      {server.public && (
                        <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Public
                        </span>
                      )}
                      {server.userId === session.user.id && (
                        <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Your Server
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
