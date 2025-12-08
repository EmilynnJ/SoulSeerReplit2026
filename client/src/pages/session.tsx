import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Clock, 
  DollarSign,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Sparkles,
  AlertCircle
} from "lucide-react";
import type { Reader, Message, Session as SessionType } from "@shared/schema";

export default function Session() {
  const { readerId } = useParams<{ readerId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const sessionType = new URLSearchParams(window.location.search).get("type") || "chat";

  const { data: reader, isLoading: readerLoading } = useQuery<Reader>({
    queryKey: ["/api/readers", readerId],
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: !!sessionId,
    refetchInterval: sessionActive ? 2000 : false,
  });

  const getRate = () => {
    if (!reader) return 0;
    switch (sessionType) {
      case "voice": return Number(reader.voiceRate);
      case "video": return Number(reader.videoRate);
      default: return Number(reader.chatRate);
    }
  };

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sessions", {
        readerId,
        type: sessionType,
        ratePerMinute: getRate().toString(),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setSessionActive(true);
      connectWebSocket(data.id);
      toast({
        title: "Session started",
        description: `Your ${sessionType} reading has begun`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      setSessionActive(false);
      if (wsRef.current) {
        wsRef.current.close();
      }
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session ended",
        description: `Total: ${Math.ceil(elapsedSeconds / 60)} minutes - $${currentCost.toFixed(2)}`,
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/sessions/${sessionId}/messages`, {
        content: message,
      });
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
    },
  });

  const connectWebSocket = (sId: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", sessionId: sId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        refetchMessages();
      }
    };

    socket.onerror = () => {
      console.error("WebSocket error");
    };

    wsRef.current = socket;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newSeconds = prev + 1;
          setCurrentCost((Math.ceil(newSeconds / 60)) * getRate());
          return newSeconds;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive, reader]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to start a reading session</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (readerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!reader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Reader Not Found</h2>
            <Link href="/readers">
              <Button>Browse Readers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reader.isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Reader Offline</h2>
            <p className="text-muted-foreground mb-4">
              {reader.displayName} is currently offline. Try again later or find another reader.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/reader/${readerId}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Link href="/readers?online=true">
                <Button>Find Online Readers</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userBalance = Number(user.balance);
  const minimumBalance = getRate() * 3;

  if (userBalance < minimumBalance && !sessionActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Insufficient Balance</h2>
            <p className="text-muted-foreground mb-4">
              You need at least ${minimumBalance.toFixed(2)} to start a session. Your balance: ${userBalance.toFixed(2)}
            </p>
            <Link href="/dashboard">
              <Button>Add Funds</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-card border-b border-border/40 p-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/30">
              <AvatarImage src={reader.profileImage || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary font-display">
                {reader.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-xl text-primary">{reader.displayName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">{sessionType}</Badge>
                <span>${getRate().toFixed(2)}/min</span>
              </div>
            </div>
          </div>

          {sessionActive && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Clock className="h-5 w-5 text-primary" />
                  {formatTime(elapsedSeconds)}
                </div>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-lg font-mono text-gold">
                  <DollarSign className="h-5 w-5" />
                  {currentCost.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Current Cost</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => endSessionMutation.mutate()}
                disabled={endSessionMutation.isPending}
                data-testid="button-end-session"
              >
                End Session
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!sessionActive ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full border-primary/20">
              <CardHeader className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-gold mb-4" />
                <CardTitle className="font-display text-3xl text-primary">
                  Start Your Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    You're about to start a <span className="font-medium capitalize">{sessionType}</span> reading with{" "}
                    <span className="font-medium text-primary">{reader.displayName}</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-gold" />
                    <span className="font-display text-2xl text-gold">{getRate().toFixed(2)}</span>
                    <span className="text-muted-foreground">per minute</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                  <p>Your balance: ${userBalance.toFixed(2)}</p>
                  <p>You'll be billed per minute. The session will automatically end if your balance runs low.</p>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => startSessionMutation.mutate()}
                  disabled={startSessionMutation.isPending}
                  data-testid="button-start-session"
                >
                  {startSessionMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {sessionType === "voice" && <Phone className="h-5 w-5" />}
                      {sessionType === "video" && <Video className="h-5 w-5" />}
                      {sessionType === "chat" && <Send className="h-5 w-5" />}
                      Start {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Reading
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="container mx-auto max-w-3xl space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Your session has started. Send a message to begin your reading.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.senderId === user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="font-body">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === user.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-border/40 p-4 bg-card">
              <div className="container mx-auto max-w-3xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (message.trim()) {
                      sendMessageMutation.mutate();
                    }
                  }}
                  className="flex gap-4"
                >
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="resize-none min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim()) {
                          sendMessageMutation.mutate();
                        }
                      }
                    }}
                    data-testid="input-message"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-[60px] w-[60px]"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
