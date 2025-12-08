import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, Package } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const getTypeIcon = () => {
    switch (product.type) {
      case "digital":
        return <Download className="h-4 w-4" />;
      case "physical":
        return <Package className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <Card className="group overflow-visible hover-elevate border-primary/20" data-testid={`card-product-${product.id}`}>
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {getTypeIcon()}
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {product.category}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-body font-semibold text-lg line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            {getTypeIcon()}
            <span className="text-xs capitalize">{product.type}</span>
          </div>
          <span className="font-display text-xl text-primary">${Number(product.price).toFixed(2)}</span>
        </div>

        <Link href={`/product/${product.id}`}>
          <Button className="w-full" data-testid={`button-view-product-${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
