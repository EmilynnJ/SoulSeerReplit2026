import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  MessageCircle, 
  Phone, 
  Video, 
  Heart,
  Clock,
  Award,
  Sparkles
} from "lucide-react";
import type { Reader, Review } from "@shared/schema";

export default function ReaderProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: reader, isLoading } = useQuery<Reader>({
    queryKey: ["/api/readers", id],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/readers", id, "reviews"],
    enabled: !!id,
  });

  const { data: isFavorite } = useQuery<boolean>({
    queryKey: ["/api/favorites/check", id],
    enabled: !!user && !!id,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { readerId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/check", id] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Skeleton className="h-48 w-48 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-2xl text-primary mb-2">Reader Not Found</h2>
            <p className="text-muted-foreground mb-4">This reader profile doesn't exist or has been removed.</p>
            <Link href="/readers">
              <Button>Browse Readers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const specialties = reader.specialties || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 overflow-hidden">
            {reader.coverImage && (
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${reader.coverImage})` }}
              />
            )}
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative mx-auto md:mx-0">
                  <Avatar className="h-40 w-40 border-4 border-primary/30">
                    <AvatarImage src={reader.profileImage || undefined} alt={reader.displayName} />
                    <AvatarFallback className="bg-primary/20 text-primary text-4xl font-display">
                      {reader.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {reader.isOnline && (
                    <span className="absolute bottom-2 right-2 h-6 w-6 bg-status-online rounded-full border-4 border-background" />
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="font-display text-4xl text-primary" data-testid="text-reader-name">
                      {reader.displayName}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      {reader.isOnline ? (
                        <Badge className="bg-status-online text-white">Online Now</Badge>
                      ) : (
                        <Badge variant="secondary">Offline</Badge>
                      )}
                      {reader.isApproved && (
                        <Badge variant="outline" className="border-gold text-gold">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {reader.rating && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(Number(reader.rating))
                                ? "fill-gold text-gold"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{Number(reader.rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">({reader.reviewCount} reviews)</span>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-muted-foreground mb-6">
                    {reader.yearsExperience && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{reader.yearsExperience} years experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{reader.totalReadings} readings</span>
                    </div>
                  </div>

                  {reader.aboutMe && (
                    <p className="text-muted-foreground font-body leading-relaxed">
                      {reader.aboutMe}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Chat</p>
                <p className="font-display text-2xl text-primary">${Number(reader.chatRate).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per minute</p>
                {reader.isOnline && (
                  <Link href={`/session/${reader.id}?type=chat`}>
                    <Button className="w-full mt-4" data-testid="button-start-chat">
                      Start Chat
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Voice</p>
                <p className="font-display text-2xl text-primary">${Number(reader.voiceRate).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per minute</p>
                {reader.isOnline && (
                  <Link href={`/session/${reader.id}?type=voice`}>
                    <Button className="w-full mt-4" variant="outline" data-testid="button-start-voice">
                      Start Call
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <Video className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Video</p>
                <p className="font-display text-2xl text-primary">${Number(reader.videoRate).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per minute</p>
                {reader.isOnline && (
                  <Link href={`/session/${reader.id}?type=video`}>
                    <Button className="w-full mt-4" variant="outline" data-testid="button-start-video">
                      Start Video
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {user && (
              <Button
                variant="outline"
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
                className="flex-1"
                data-testid="button-toggle-favorite"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current text-destructive" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            )}
            <Link href={`/messages/${reader.userId}`} className="flex-1">
              <Button variant="outline" className="w-full" data-testid="button-send-message">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </Link>
          </div>

          {reviews && reviews.length > 0 && (
            <Card className="border-primary/20 mt-8">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-primary">Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-gold text-gold" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground font-body">{review.comment}</p>
                      )}
                      {review.readerResponse && (
                        <div className="mt-3 pl-4 border-l-2 border-primary/30">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-primary">Response from {reader.displayName}:</span>{" "}
                            {review.readerResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
