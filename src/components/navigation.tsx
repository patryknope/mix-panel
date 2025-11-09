'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, Trophy, Users, Server, Settings, LogOut, LogIn } from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()
// xd
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Get5 Panel
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 text-sm hover:text-primary">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              {status === 'authenticated' && (
                <>
                  <Link href="/matches" className="flex items-center space-x-2 text-sm hover:text-primary">
                    <Trophy className="h-4 w-4" />
                    <span>Matches</span>
                  </Link>
                  
                  <Link href="/teams" className="flex items-center space-x-2 text-sm hover:text-primary">
                    <Users className="h-4 w-4" />
                    <span>Teams</span>
                  </Link>
                  
                  <Link href="/servers" className="flex items-center space-x-2 text-sm hover:text-primary">
                    <Server className="h-4 w-4" />
                    <span>Servers</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : status === 'authenticated' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.avatar || ''} alt={session.user.name} />
                      <AvatarFallback>{session.user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.steamId}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => signIn('steam')}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login with Steam</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
