'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function AddServerPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      ip: formData.get('ip') as string,
      port: parseInt(formData.get('port') as string),
      rconPassword: formData.get('rconPassword') as string,
      public: formData.get('public') === 'on',
    }

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add server')
      }

      router.push('/servers')
    } catch (error: any) {
      console.error(error)
      setError(error.message || 'Failed to add server')
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
              <p>Please sign in to add a server</p>
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
          <Link href="/servers">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Servers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add Server</h1>
          <p className="text-muted-foreground">
            Connect a new CS2 game server
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Server Details</CardTitle>
              <CardDescription>
                Configure your CS2 server connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My CS2 Server"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address *</Label>
                  <Input
                    id="ip"
                    name="ip"
                    placeholder="192.168.1.100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    placeholder="27015"
                    required
                    min="1"
                    max="65535"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rconPassword">RCON Password *</Label>
                <Input
                  id="rconPassword"
                  name="rconPassword"
                  type="password"
                  placeholder="Your RCON password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This password is stored securely and used to send commands to your server
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  name="public"
                  className="h-4 w-4"
                />
                <Label htmlFor="public" className="cursor-pointer">
                  Make server public (visible to all users)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Install MatchZy plugin on your CS2 server</li>
                <li>Configure <code className="bg-white px-1 rounded">get5_web_api_url</code> to point to this panel</li>
                <li>Set <code className="bg-white px-1 rounded">get5_web_api_key</code> with your match API key</li>
                <li>Enable RCON in your server.cfg</li>
                <li>Restart your server</li>
              </ol>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Server'}
            </Button>
            <Link href="/servers" className="flex-1">
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
