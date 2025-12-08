import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/shop/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ShoppingBag, Sparkles } from "lucide-react";
import type { Product } from "@shared/schema";

const categoryOptions = [
  "Digital Guides",
  "Meditation",
  "Tarot Spreads",
  "Courses",
  "Physical Items",
  "Gift Cards",
  "Services",
];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = (products || [])
    .filter((product) => product.isActive)
    .filter((product) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          product.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((product) => {
      if (selectedCategory && selectedCategory !== "all") {
        return product.category.toLowerCase() === selectedCategory.toLowerCase();
      }
      return true;
    })
    .filter((product) => {
      if (selectedType && selectedType !== "all") {
        return product.type === selectedType;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number(a.price) - Number(b.price);
        case "price-high":
          return Number(b.price) - Number(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-primary mb-4" data-testid="text-shop-title">
            Mystical Marketplace
          </h1>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover spiritual tools, digital guides, and sacred items from our gifted readers
          </p>
        </div>

        <div className="bg-card/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
              data-testid="button-type-all"
            >
              All Types
            </Button>
            <Button
              variant={selectedType === "digital" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("digital")}
              data-testid="button-type-digital"
            >
              Digital
            </Button>
            <Button
              variant={selectedType === "physical" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("physical")}
              data-testid="button-type-physical"
            >
              Physical
            </Button>
            <Button
              variant={selectedType === "service" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("service")}
              data-testid="button-type-service"
            >
              Services
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-primary/20">
                <div className="aspect-square">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-2xl text-primary mb-2">No Products Found</h3>
            <p className="text-muted-foreground font-body">
              {products && products.length === 0
                ? "Check back soon for new mystical offerings!"
                : "Try adjusting your filters or search query"}
            </p>
            {searchQuery || selectedCategory !== "all" || selectedType !== "all" ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        <section className="mt-20 py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg">
          <div className="text-center space-y-4 px-4">
            <Sparkles className="h-10 w-10 mx-auto text-gold" />
            <h2 className="font-display text-3xl text-primary">Are You a Reader?</h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              List your digital products, courses, and services in our marketplace. Keep 70% of every sale!
            </p>
            <Button size="lg" variant="outline" data-testid="button-sell-products">
              Start Selling
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
