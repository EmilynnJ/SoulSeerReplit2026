import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Wallet, 
  MessageCircle, 
  Phone,
  Video,
  Clock, 
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles
} from "lucide-react";
import type { Session, Reader } from "@shared/schema";
import { useState } from "react";

export default function ReaderDashboard() {
  const { user, reader, refreshUser } = useAuth();
  const { toast } = useToast();
  const [chatRate, setChatRate] = useState(reader?.chatRate || "3.99");
  const [voiceRate, setVoiceRate] = useState(reader?.voiceRate || "4.99");
  const [videoRate, setVideoRate] = useState(reader?.videoRate || "5.99");

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/reader"],
    enabled: !!reader,
  });

  const toggleOnlineMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/readers/${reader?.id}/status`, { 
        isOnline: !reader?.isOnline 
      });
    },
    onSuccess: () => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/readers"] });
      toast({
        title: reader?.isOnline ? "You are now offline" : "You are now online",
        description: reader?.isOnline 
          ? "Clients won't be able to start new sessions with you" 
          : "Clients can now request readings from you",
      });
    },
  });

  const updateRatesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/readers/${reader?.id}/rates`, {
        chatRate,
        voiceRate,
        videoRate,
      });
    },
    onSuccess: () => {
      refreshUser();
      toast({
        title: "Rates updated",
        description: "Your per-minute rates have been saved",
      });
    },
  });

  if (!user || !reader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Reader Access Required</h2>
            <p className="text-muted-foreground mb-4">This dashboard is for approved readers only</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todaySessions = sessions?.filter(s => {
    const today = new Date();
    const sessionDate = new Date(s.createdAt);
    return sessionDate.toDateString() === today.toDateString();
  }) || [];

  const todayEarnings = todaySessions.reduce((sum, s) => sum + Number(s.readerEarnings || 0), 0);
  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;
  const avgRating = reader.rating ? Number(reader.rating).toFixed(1) : "N/A";

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-2" data-testid="text-reader-dashboard-title">
              Reader Dashboard
            </h1>
            <p className="text-muted-foreground font-body">
              Manage your readings, earnings, and availability
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${reader.isOnline ? "bg-status-online animate-pulse" : "bg-status-offline"}`} />
              <span className="font-medium">{reader.isOnline ? "Online" : "Offline"}</span>
            </div>
            <Switch
              checked={reader.isOnline}
              onCheckedChange={() => toggleOnlineMutation.mutate()}
              disabled={toggleOnlineMutation.isPending}
              data-testid="switch-online-status"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="font-display text-3xl text-gold" data-testid="text-today-earnings">
                    ${todayEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-gold" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {todaySessions.length} session{todaySessions.length !== 1 ? "s" : ""} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payout</p>
                  <p className="font-display text-3xl text-primary" data-testid="text-pending-payout">
                    ${Number(reader.pendingPayout).toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                ${Number(reader.totalEarnings).toFixed(2)} total earned
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Readings</p>
                  <p className="font-display text-3xl text-primary">
                    {reader.totalReadings}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {totalMinutes} total minutes
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-display text-3xl text-primary flex items-center gap-2">
                    <Star className="h-6 w-6 fill-gold text-gold" />
                    {avgRating}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {reader.reviewCount} review{reader.reviewCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Per-Minute Rates</CardTitle>
                <CardDescription>Set your rates for each session type (you keep 70%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      Chat Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.99"
                        value={chatRate}
                        onChange={(e) => setChatRate(e.target.value)}
                        className="pl-7"
                        data-testid="input-chat-rate"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">per minute</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Voice Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.99"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(e.target.value)}
                        className="pl-7"
                        data-testid="input-voice-rate"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">per minute</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      Video Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.99"
                        value={videoRate}
                        onChange={(e) => setVideoRate(e.target.value)}
                        className="pl-7"
                        data-testid="input-video-rate"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">per minute</p>
                  </div>
                </div>

                <Button 
                  className="mt-6" 
                  onClick={() => updateRatesMutation.mutate()}
                  disabled={updateRatesMutation.isPending}
                  data-testid="button-save-rates"
                >
                  {updateRatesMutation.isPending ? "Saving..." : "Save Rates"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="font-display text-2xl text-primary">Recent Sessions</CardTitle>
                    <CardDescription>Your latest client readings</CardDescription>
                  </div>
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
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {session.type === "chat" && <MessageCircle className="h-5 w-5 text-primary" />}
                            {session.type === "voice" && <Phone className="h-5 w-5 text-primary" />}
                            {session.type === "video" && <Video className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{session.type} Reading</p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration} min • {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.status === "completed" ? "secondary" : "outline"}>
                            {session.status}
                          </Badge>
                          <p className="text-sm font-medium text-gold mt-1">
                            +${Number(session.readerEarnings || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-body">No sessions yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Toggle online to start receiving clients
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="font-medium">{reader.displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialties</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(reader.specialties || []).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{reader.yearsExperience || 0} years</p>
                </div>
                <Link href={`/reader/${reader.id}`}>
                  <Button variant="outline" className="w-full" data-testid="button-view-profile">
                    View Public Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-10 w-10 mx-auto text-gold mb-3" />
                <h3 className="font-display text-xl text-primary mb-2">Ready for Readings?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {reader.isOnline 
                    ? "You're online and visible to clients" 
                    : "Toggle online to start receiving clients"}
                </p>
                <Button 
                  className="w-full" 
                  variant={reader.isOnline ? "outline" : "default"}
                  onClick={() => toggleOnlineMutation.mutate()}
                  disabled={toggleOnlineMutation.isPending}
                  data-testid="button-toggle-status"
                >
                  {reader.isOnline ? "Go Offline" : "Go Online"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
