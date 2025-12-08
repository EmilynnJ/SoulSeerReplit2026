import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { MessageCircle, Search, Inbox, Sparkles } from "lucide-react";
import type { Message, User as UserType } from "@shared/schema";

interface Conversation {
  otherUser: UserType;
  lastMessage: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!user,
  });

  const filteredConversations = (conversations || []).filter((conv) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (conv.otherUser.fullName && conv.otherUser.fullName.toLowerCase().includes(query)) ||
        conv.otherUser.username.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your messages</p>
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-primary mb-2" data-testid="text-messages-title">
            Messages
          </h1>
          <p className="text-muted-foreground font-body">
            Your conversations with readers and clients
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-messages"
          />
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-primary">Inbox</CardTitle>
            <CardDescription>
              {conversations?.length || 0} conversation{(conversations?.length || 0) !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl text-primary mb-2">
                  {searchQuery ? "No Conversations Found" : "No Messages Yet"}
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Start a conversation with a reader to get guidance"}
                </p>
                {!searchQuery && (
                  <Link href="/readers">
                    <Button data-testid="button-find-readers">
                      Find Readers
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredConversations.map((conv) => (
                  <Link 
                    key={conv.otherUser.id} 
                    href={`/messages/${conv.otherUser.id}`}
                    className="block"
                  >
                    <div 
                      className="flex items-center gap-4 p-4 hover-elevate rounded-lg cursor-pointer"
                      data-testid={`conversation-${conv.otherUser.id}`}
                    >
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={conv.otherUser.profileImage || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {(conv.otherUser.fullName || conv.otherUser.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {conv.otherUser.fullName || conv.otherUser.username}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage.senderId === user.id && "You: "}
                          {conv.lastMessage.content}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </p>
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
