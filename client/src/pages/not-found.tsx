import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md border-primary/20">
        <CardContent className="p-12 text-center space-y-6">
          <Sparkles className="h-16 w-16 mx-auto text-primary" />
          <div className="space-y-2">
            <h1 className="font-display text-5xl text-primary" data-testid="text-404-title">404</h1>
            <h2 className="font-display text-2xl text-primary">Page Not Found</h2>
            <p className="text-muted-foreground font-body">
              The cosmic path you seek does not exist in this realm
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/readers">
              <Button variant="outline" data-testid="button-find-readers">
                <Search className="h-4 w-4 mr-2" />
                Find Readers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
