"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Train, User, LogOut, Settings, Ticket, Menu, X } from "lucide-react"

export function Header() {
  const { user, userProfile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Train className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold railway-gradient bg-clip-text text-transparent">
            Railways Kenya
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/search" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Search Trains
          </Link>
          <Link href="/routes" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Routes
          </Link>
          {user && (
            <Link href="/bookings" className="text-sm font-medium hover:text-blue-600 transition-colors">
              My Bookings
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Auth Buttons (Desktop Only) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userProfile?.full_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings">
                    <Ticket className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                {userProfile?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-sm px-4 py-4 space-y-3">
          <Link href="/search" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            Search Trains
          </Link>
          <Link href="/routes" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
            Routes
          </Link>
          {user && (
            <Link href="/bookings" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              My Bookings
            </Link>
          )}
          {!user ? (
            <>
              <Link href="/auth/login" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/auth/register" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/admin" className="block text-sm font-medium hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
              <button
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left text-sm font-medium text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
