import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, Heart, Shield, Users, Sparkles, Moon } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <section className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6" data-testid="text-about-title">
            About SoulSeer
          </h1>
          <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
            A community of gifted psychics united by our life's calling: to guide, heal, and empower those who seek clarity on their journey.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="font-display text-4xl text-primary">Our Mission</h2>
            <div className="font-body text-lg text-muted-foreground space-y-4">
              <p>
                At SoulSeer, we are dedicated to providing ethical, compassionate, and judgment-free spiritual guidance. Our mission is twofold: to offer clients genuine, heart-centered readings and to uphold fair, ethical standards for our readers.
              </p>
              <p>
                Founded by psychic medium Emilynn, SoulSeer was created as a response to the corporate greed that dominates many psychic platforms. Unlike other apps, our readers keep the majority of what they earn and play an active role in shaping the platform.
              </p>
              <p>
                SoulSeer is more than just an app—it's a soul tribe. A community of gifted psychics united by our life's calling: to guide, heal, and empower those who seek clarity on their journey.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg" />
              <img
                src="https://i.postimg.cc/s2ds9RtC/FOUNDER.jpg"
                alt="Emilynn, Founder of SoulSeer"
                className="rounded-lg w-full max-w-md mx-auto shadow-xl"
                data-testid="img-founder"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="font-display text-2xl text-primary">Emilynn</p>
                <p className="font-body text-sm text-muted-foreground">Founder & Psychic Medium</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="font-display text-4xl text-primary text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Compassion</h3>
                <p className="text-muted-foreground font-body">
                  Every reading is approached with empathy, understanding, and genuine care for our clients' wellbeing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Ethics</h3>
                <p className="text-muted-foreground font-body">
                  We maintain the highest ethical standards, ensuring honest, responsible readings without exploitation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-primary">Community</h3>
                <p className="text-muted-foreground font-body">
                  We're building a supportive community where readers thrive and clients find genuine connection.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-20">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-12">
            <h2 className="font-display text-4xl text-primary text-center mb-8">Why Choose SoulSeer?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-xl text-primary mb-2">70/30 Revenue Split</h4>
                  <p className="text-muted-foreground font-body">
                    Our readers keep 70% of their earnings—far more than industry standard. Happy readers provide better readings.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-xl text-primary mb-2">Vetted Readers</h4>
                  <p className="text-muted-foreground font-body">
                    Every reader goes through a careful vetting process to ensure authenticity and ethical standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Moon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-xl text-primary mb-2">Multiple Reading Types</h4>
                  <p className="text-muted-foreground font-body">
                    Choose from chat, voice, or video readings—whichever feels most comfortable for your journey.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h4 className="font-display text-xl text-primary mb-2">Pay Per Minute</h4>
                  <p className="text-muted-foreground font-body">
                    Only pay for the time you use. No hidden fees, no commitments—just honest, transparent pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-12 space-y-6">
              <Sparkles className="h-12 w-12 mx-auto text-gold" />
              <h2 className="font-display text-4xl text-primary">
                Ready to Begin Your Journey?
              </h2>
              <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're seeking answers, healing, or simply a compassionate ear, our gifted readers are here to guide you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/readers">
                  <Button size="lg" className="text-lg px-8" data-testid="button-find-reader-cta">
                    Find Your Reader
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-become-reader-cta">
                    Become a Reader
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
