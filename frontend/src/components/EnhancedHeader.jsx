"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../lib/features/authSlice"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import {
  FileText,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Plus,
  BarChart3,
  FileIcon as FileTemplate,
  Users,
  Menu,
  X,
} from "lucide-react"
import NotificationCenter from "./NotificationCenter"

export default function EnhancedHeader({ currentView, onNavigate, onCreateProposal, onLogout, canCreateProposals, canCreateTemplates, userRole }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the md breakpoint in Tailwind
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      dispatch(logout())
    }
  }

  const navigationItems = [
    // Dashboard - Only for non-user roles
    ...(userRole !== "user" ? [{ id: "dashboard", label: "Dashboard", icon: BarChart3 }] : []),
    { id: "list", label: "Proposals", icon: FileText },
    // Templates - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "templates", label: "Templates", icon: FileTemplate }] : []),
    // Team - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "team", label: "Team", icon: Users }] : []),
  ]

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ProposalHub
                </h1>
                {/* <p className="text-xs text-muted-foreground">Enterprise Proposal Management</p> */}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onNavigate(item.id)}
                    className={currentView === item.id ? "bg-gradient-to-r from-blue-600 to-purple-600 mr-1" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Create Button - Only for managers and admins */}
            {canCreateProposals && (
              <Button
                onClick={onCreateProposal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Proposal</span>
              </Button>
            )}

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" sideOffset={5}>
                <NotificationCenter />
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {userRole || user?.role || 'Unknown'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-md animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onNavigate(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`justify-start w-full ${currentView === item.id ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
              
              {/* Mobile Create Button - Only for managers and admins */}
              {canCreateProposals && (
                <Button
                  onClick={() => {
                    onCreateProposal()
                    setMobileMenuOpen(false)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  New Proposal
                </Button>
              )}
              
              {/* Mobile Search */}
              <div className="relative mt-2 pt-2 border-t">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
