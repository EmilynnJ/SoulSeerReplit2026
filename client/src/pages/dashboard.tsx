import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { 
  Wallet, 
  MessageCircle, 
  Clock, 
  Star, 
  Heart,
  Plus,
  History,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import type { Session, Reader, Favorite } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/client"],
    enabled: !!user,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery<(Favorite & { reader: Reader })[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const recentSessions = sessions?.slice(0, 5) || [];
  const totalSpent = sessions?.reduce((sum, s) => sum + Number(s.totalCost || 0), 0) || 0;
  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-2" data-testid="text-dashboard-title">
            Welcome, {user.fullName || user.username}
          </h1>
          <p className="text-muted-foreground font-body">
            Manage your readings, balance, and favorites
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-display text-3xl text-primary" data-testid="text-balance">
                    ${Number(user.balance).toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Button className="w-full mt-4" size="sm" data-testid="button-add-funds">
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="font-display text-3xl text-primary">
                    {sessions?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                ${totalSpent.toFixed(2)} spent total
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Minutes Used</p>
                  <p className="font-display text-3xl text-primary">
                    {totalMinutes}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Across all readings
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="font-display text-3xl text-primary">
                    {favorites?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Link href="/readers">
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Find Readers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-2xl text-primary">Recent Sessions</CardTitle>
                    <CardDescription>Your latest readings and consultations</CardDescription>
                  </div>
                  <Link href="/sessions">
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-body">No sessions yet</p>
                    <Link href="/readers">
                      <Button className="mt-4">
                        Find a Reader
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{session.type} Reading</p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration} min • {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.status === "completed" ? "secondary" : "outline"}>
                            {session.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${Number(session.totalCost || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-2xl text-primary">Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link href="/readers">
                    <Button variant="outline" className="w-full h-24 flex-col gap-2" data-testid="button-quick-readers">
                      <Star className="h-6 w-6" />
                      <span className="text-sm">Find Readers</span>
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full h-24 flex-col gap-2" data-testid="button-quick-messages">
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm">Messages</span>
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" className="w-full h-24 flex-col gap-2" data-testid="button-quick-shop">
                      <ShoppingBag className="h-6 w-6" />
                      <span className="text-sm">Shop</span>
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="outline" className="w-full h-24 flex-col gap-2" data-testid="button-quick-orders">
                      <History className="h-6 w-6" />
                      <span className="text-sm">Orders</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Favorite Readers</CardTitle>
                <CardDescription>Your saved psychics</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : favorites && favorites.length > 0 ? (
                  <div className="space-y-3">
                    {favorites.slice(0, 5).map((fav) => (
                      <Link key={fav.id} href={`/reader/${fav.readerId}`}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                          <Avatar className="h-10 w-10 border-2 border-primary/30">
                            <AvatarImage src={fav.reader?.profileImage || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {fav.reader?.displayName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{fav.reader?.displayName}</p>
                            <div className="flex items-center gap-1">
                              {fav.reader?.isOnline && (
                                <span className="h-2 w-2 bg-status-online rounded-full" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {fav.reader?.isOnline ? "Online" : "Offline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No favorites yet</p>
                    <Link href="/readers">
                      <Button variant="link" size="sm" className="mt-2">
                        Browse Readers
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-10 w-10 mx-auto text-gold mb-3" />
                <h3 className="font-display text-xl text-primary mb-2">Need Guidance?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with a reader now for instant spiritual insight
                </p>
                <Link href="/readers?online=true">
                  <Button className="w-full" data-testid="button-connect-reader">
                    Connect Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
