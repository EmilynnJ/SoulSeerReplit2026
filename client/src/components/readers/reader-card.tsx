import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle, Phone, Video } from "lucide-react";
import type { Reader } from "@shared/schema";

interface ReaderCardProps {
  reader: Reader;
}

export function ReaderCard({ reader }: ReaderCardProps) {
  const specialties = reader.specialties || [];

  return (
    <Card className="group overflow-visible hover-elevate border-primary/20" data-testid={`card-reader-${reader.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              <AvatarImage src={reader.profileImage || undefined} alt={reader.displayName} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display">
                {reader.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {reader.isOnline && (
              <span className="absolute bottom-1 right-1 h-5 w-5 bg-status-online rounded-full border-2 border-background" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl text-primary">{reader.displayName}</h3>
            
            {reader.rating && (
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="text-sm font-body">{Number(reader.rating).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({reader.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1">
              {specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full text-center">
            <div className="space-y-1">
              <MessageCircle className="h-4 w-4 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">${Number(reader.chatRate).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per min</p>
            </div>
            <div className="space-y-1">
              <Phone className="h-4 w-4 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">${Number(reader.voiceRate).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per min</p>
            </div>
            <div className="space-y-1">
              <Video className="h-4 w-4 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">${Number(reader.videoRate).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per min</p>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Link href={`/reader/${reader.id}`} className="flex-1">
              <Button variant="outline" className="w-full" data-testid={`button-view-reader-${reader.id}`}>
                View Profile
              </Button>
            </Link>
            {reader.isOnline && (
              <Link href={`/session/${reader.id}`} className="flex-1">
                <Button className="w-full" data-testid={`button-start-reading-${reader.id}`}>
                  Start Reading
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
