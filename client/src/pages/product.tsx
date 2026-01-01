import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Download, Package, ArrowLeft, Star, User } from "lucide-react";
import type { Product, Reader, User as UserType } from "@shared/schema";
import { Link } from "wouter";

interface ProductWithReader extends Product {
  reader?: Reader & { user?: UserType };
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: product, isLoading } = useQuery<ProductWithReader>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/checkout-product", {
        productId: id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Unable to start checkout",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    },
  });

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsCheckingOut(true);
    checkoutMutation.mutate();
  };

  const getTypeIcon = () => {
    switch (product?.type) {
      case "digital":
        return <Download className="h-5 w-5" />;
      case "physical":
        return <Package className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-display text-primary mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button data-testid="button-back-to-shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/shop">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-shop">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-card">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {getTypeIcon()}
              </div>
            )}
            <Badge className="absolute top-4 right-4" variant="secondary">
              {product.category}
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl text-primary mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                {getTypeIcon()}
                <span className="capitalize">{product.type}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl text-primary" data-testid="text-product-price">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            {product.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {product.reader && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Offered by</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/reader/${product.reader.id}`}>
                    <div className="flex items-center gap-3 hover-elevate p-2 rounded-md -m-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {product.reader.user?.profileImage ? (
                          <img
                            src={product.reader.user.profileImage}
                            alt={product.reader.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium" data-testid="text-reader-name">{product.reader.displayName}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{product.reader.rating ? Number(product.reader.rating).toFixed(1) : "New"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={isCheckingOut || checkoutMutation.isPending}
              data-testid="button-buy-now"
            >
              {isCheckingOut || checkoutMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                You'll need to sign in to complete your purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
