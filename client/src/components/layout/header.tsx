import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Menu, X, User, LogOut, LayoutDashboard, MessageSquare, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/readers", label: "Readings" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "reader") return "/reader-dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/">
          <span className="font-display text-3xl text-primary cursor-pointer" data-testid="link-home-logo">
            SoulSeer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className="font-body"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9 border-2 border-primary/50">
                    <AvatarImage src={user.profileImage || undefined} alt={user.fullName || user.username} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {(user.fullName || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(user.fullName || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.fullName || user.username}</span>
                    <span className="text-xs text-muted-foreground">${Number(user.balance).toFixed(2)} balance</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" data-testid="link-login">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button data-testid="link-register">Get Started</Button>
              </Link>
            </div>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start font-body"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {!user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
