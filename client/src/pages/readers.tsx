import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReaderCard } from "@/components/readers/reader-card";
import { ReaderCardSkeleton } from "@/components/readers/reader-card-skeleton";
import { Search, Filter, Star, Sparkles } from "lucide-react";
import type { Reader } from "@shared/schema";

const specialtyOptions = [
  "Tarot",
  "Clairvoyant",
  "Medium",
  "Astrology",
  "Love & Relationships",
  "Career",
  "Dream Analysis",
  "Energy Healing",
  "Past Lives",
  "Pet Psychic",
];

export default function Readers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating");

  const { data: readers, isLoading } = useQuery<Reader[]>({
    queryKey: ["/api/readers"],
  });

  const filteredReaders = (readers || [])
    .filter((reader) => reader.isApproved)
    .filter((reader) => {
      if (showOnlineOnly && !reader.isOnline) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          reader.displayName.toLowerCase().includes(query) ||
          (reader.aboutMe && reader.aboutMe.toLowerCase().includes(query)) ||
          (reader.specialties || []).some((s) => s.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((reader) => {
      if (selectedSpecialty && selectedSpecialty !== "all") {
        return (reader.specialties || []).some(
          (s) => s.toLowerCase() === selectedSpecialty.toLowerCase()
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "price-low":
          return Number(a.chatRate) - Number(b.chatRate);
        case "price-high":
          return Number(b.chatRate) - Number(a.chatRate);
        default:
          return 0;
      }
    });

  const onlineCount = (readers || []).filter((r) => r.isOnline && r.isApproved).length;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-primary mb-4" data-testid="text-readers-title">
            Our Gifted Readers
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg">
            Connect with our community of verified psychics, mediums, and spiritual guides
          </p>
          {onlineCount > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="h-3 w-3 bg-status-online rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">{onlineCount} readers online now</span>
            </div>
          )}
        </div>

        <div className="bg-card/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search readers by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-readers"
              />
            </div>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger data-testid="select-specialty">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialtyOptions.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={showOnlineOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              data-testid="button-online-filter"
            >
              <span className="h-2 w-2 bg-status-online rounded-full mr-2" />
              Online Now
            </Button>
            {selectedSpecialty && selectedSpecialty !== "all" && (
              <Badge variant="secondary" className="text-sm py-1">
                {selectedSpecialty}
                <button
                  className="ml-2 hover:text-destructive"
                  onClick={() => setSelectedSpecialty("all")}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ReaderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredReaders.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-2xl text-primary mb-2">No Readers Found</h3>
            <p className="text-muted-foreground font-body">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("all");
                setShowOnlineOnly(false);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredReaders.length} reader{filteredReaders.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredReaders.map((reader) => (
                <ReaderCard key={reader.id} reader={reader} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
