import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReaderCard } from "@/components/readers/reader-card";
import { ReaderCardSkeleton } from "@/components/readers/reader-card-skeleton";
import { Star, Sparkles, Moon, MessageCircle, Phone, Video, Shield, Heart } from "lucide-react";
import type { Reader } from "@shared/schema";

export default function Home() {
  const { data: readers, isLoading } = useQuery<Reader[]>({
    queryKey: ["/api/readers"],
  });

  const onlineReaders = readers?.filter((r) => r.isOnline && r.isApproved) || [];
  const featuredReaders = readers?.filter((r) => r.isApproved).slice(0, 6) || [];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-display text-6xl md:text-8xl text-primary drop-shadow-lg" data-testid="text-hero-title">
              SoulSeer
            </h1>
            <p className="font-body text-xl md:text-2xl text-white/90 max-w-2xl mx-auto" data-testid="text-hero-tagline">
              A Community of Gifted Psychics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/readers">
              <Button size="lg" className="text-lg px-8" data-testid="button-find-reader">
                <Sparkles className="h-5 w-5 mr-2" />
                Find Your Reader
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Badge variant="secondary" className="text-sm py-2 px-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Secure & Private
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Heart className="h-4 w-4 mr-2" />
              Ethical Readers
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Star className="h-4 w-4 mr-2" />
              70% to Readers
            </Badge>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {onlineReaders.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4" data-testid="text-online-readers-title">
              Readers Online Now
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Connect instantly with our gifted readers who are available right now for your guidance
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="h-3 w-3 bg-status-online rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">{onlineReaders.length} readers available</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {onlineReaders.slice(0, 4).map((reader) => (
              <ReaderCard key={reader.id} reader={reader} />
            ))}
          </div>

          {onlineReaders.length > 4 && (
            <div className="text-center mt-8">
              <Link href="/readers?online=true">
                <Button variant="outline" size="lg" data-testid="button-view-all-online">
                  View All Online Readers
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
              How It Works
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Getting spiritual guidance has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-primary/20 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Choose Your Reader</h3>
                <p className="text-muted-foreground font-body">
                  Browse our community of verified psychics and find the perfect match for your needs
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Connect Instantly</h3>
                <p className="text-muted-foreground font-body">
                  Chat, call, or video with your reader. Pay only for the time you use, billed per minute
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Moon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Receive Guidance</h3>
                <p className="text-muted-foreground font-body">
                  Get clarity and insight from compassionate readers dedicated to your spiritual journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            Our Gifted Readers
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Each reader in our community has been carefully vetted to ensure authentic, ethical readings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ReaderCardSkeleton key={i} />)
          ) : (
            featuredReaders.map((reader) => (
              <ReaderCard key={reader.id} reader={reader} />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link href="/readers">
            <Button size="lg" data-testid="button-browse-all-readers">
              Browse All Readers
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary">Live Chat</h3>
              <p className="text-muted-foreground font-body">
                Text-based readings for thoughtful, detailed guidance at your own pace
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary">Voice Calls</h3>
              <p className="text-muted-foreground font-body">
                Private phone sessions for those who prefer verbal communication
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary">Video Sessions</h3>
              <p className="text-muted-foreground font-body">
                Face-to-face readings for the most personal spiritual experience
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-12 text-center space-y-6">
            <Sparkles className="h-12 w-12 mx-auto text-gold" />
            <h2 className="font-display text-4xl md:text-5xl text-primary">
              Ready for Clarity?
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of seekers who have found guidance, healing, and peace through our gifted readers
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8" data-testid="button-cta-signup">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/readers">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-cta-browse">
                  Browse Readers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
