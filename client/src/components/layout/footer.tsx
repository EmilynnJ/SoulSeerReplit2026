import { Link } from "wouter";
import { Star, Moon, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-display text-3xl text-primary">SoulSeer</span>
            <p className="text-sm text-muted-foreground font-body">
              A community of gifted psychics dedicated to providing ethical, compassionate, and judgment-free spiritual guidance.
            </p>
            <div className="flex gap-2">
              <Star className="h-5 w-5 text-gold" />
              <Moon className="h-5 w-5 text-primary" />
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl text-primary mb-4">Services</h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link href="/readers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Live Readings
                </Link>
              </li>
              <li>
                <Link href="/readers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Chat Sessions
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  Digital Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gift Readings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl text-primary mb-4">Company</h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/readers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Our Readers
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Become a Reader
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl text-primary mb-4">Legal</h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Reader Agreement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground font-body">
            &copy; {new Date().getFullYear()} SoulSeer. All rights reserved. For entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
