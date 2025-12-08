import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Star, 
  DollarSign, 
  MessageCircle,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  ShoppingBag
} from "lucide-react";
import type { User as UserType, Reader, Session, Product } from "@shared/schema";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  const { data: readers, isLoading: readersLoading } = useQuery<Reader[]>({
    queryKey: ["/api/admin/readers"],
    enabled: user?.role === "admin",
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["/api/admin/sessions"],
    enabled: user?.role === "admin",
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: user?.role === "admin",
  });

  const approveReaderMutation = useMutation({
    mutationFn: async (readerId: string) => {
      return apiRequest("PATCH", `/api/admin/readers/${readerId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/readers"] });
      toast({
        title: "Reader approved",
        description: "The reader can now accept clients",
      });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You don't have permission to access this page</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = (sessions || []).reduce((sum, s) => sum + Number(s.platformFee || 0), 0);
  const pendingReaders = (readers || []).filter(r => !r.isApproved);
  const onlineReaders = (readers || []).filter(r => r.isOnline);

  const filteredUsers = (users || []).filter((u) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.fullName && u.fullName.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const filteredReaders = (readers || []).filter((r) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return r.displayName.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-2" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-body">
            Manage users, readers, and platform analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="font-display text-3xl text-primary">
                    {users?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Readers</p>
                  <p className="font-display text-3xl text-primary">
                    {readers?.filter(r => r.isApproved).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {onlineReaders.length} online now
              </p>
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
            </CardContent>
          </Card>

          <Card className="border-gold/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Revenue</p>
                  <p className="font-display text-3xl text-gold">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-gold" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                30% platform fee
              </p>
            </CardContent>
          </Card>
        </div>

        {pendingReaders.length > 0 && (
          <Card className="border-gold/30 mb-8">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-gold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Pending Reader Approvals ({pendingReaders.length})
              </CardTitle>
              <CardDescription>Review and approve new reader applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReaders.map((reader) => (
                  <div key={reader.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gold/30">
                        <AvatarImage src={reader.profileImage || undefined} />
                        <AvatarFallback className="bg-gold/10 text-gold">
                          {reader.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{reader.displayName}</p>
                        <div className="flex gap-1 flex-wrap">
                          {(reader.specialties || []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveReaderMutation.mutate(reader.id)}
                        disabled={approveReaderMutation.isPending}
                        data-testid={`button-approve-${reader.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-reject-${reader.id}`}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, readers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-admin-search"
          />
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="readers" data-testid="tab-readers">
              <Star className="h-4 w-4 mr-2" />
              Readers
            </TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">
              <MessageCircle className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">All Users</CardTitle>
                <CardDescription>{filteredUsers.length} users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src={u.profileImage || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {(u.fullName || u.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{u.fullName || u.username}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={u.role === "admin" ? "default" : u.role === "reader" ? "secondary" : "outline"}>
                            {u.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${Number(u.balance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readers">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">All Readers</CardTitle>
                <CardDescription>{filteredReaders.length} readers</CardDescription>
              </CardHeader>
              <CardContent>
                {readersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReaders.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarImage src={r.profileImage || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {r.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {r.isOnline && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 bg-status-online rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{r.displayName}</p>
                            <div className="flex gap-1">
                              {(r.specialties || []).slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <p className="text-gold">${Number(r.totalEarnings).toFixed(2)} earned</p>
                            <p className="text-muted-foreground">{r.totalReadings} readings</p>
                          </div>
                          <Badge variant={r.isApproved ? "default" : "outline"}>
                            {r.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Recent Sessions</CardTitle>
                <CardDescription>{sessions?.length || 0} total sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 20).map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium capitalize">{s.type} Session</p>
                          <p className="text-sm text-muted-foreground">
                            {s.duration} min • {new Date(s.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={s.status === "completed" ? "secondary" : "outline"}>
                            {s.status}
                          </Badge>
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">Total:</span>{" "}
                            <span className="font-medium">${Number(s.totalCost || 0).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No sessions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Products</CardTitle>
                <CardDescription>{products?.length || 0} products in marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                {products && products.length > 0 ? (
                  <div className="space-y-3">
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{p.category} • {p.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg text-primary">${Number(p.price).toFixed(2)}</span>
                          <Badge variant={p.isActive ? "default" : "secondary"}>
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
