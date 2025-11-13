import { Navigation } from '@/components/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your Steam profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {session.user.avatar && (
                  <img
                    src={session.user.avatar}
                    alt={session.user.name}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div>
                  <p className="text-lg font-medium">{session.user.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Steam ID: {session.user.steamId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: {session.user.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Use the theme toggle in the navigation bar to switch between light and dark mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Language</p>
                <p className="text-sm text-muted-foreground">
                  Use the language selector in the navigation bar to change your language (EN/PL/DE)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">Get5 Panel</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documentation</span>
                <a
                  href="https://github.com/shobhit-pathak/MatchZy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  MatchZy Docs
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
