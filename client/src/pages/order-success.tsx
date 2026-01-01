import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Download, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function OrderSuccess() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const sessionId = searchParams.get("session_id");
  const productType = searchParams.get("type");

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/confirm-order", {
        sessionId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  useEffect(() => {
    if (sessionId && user) {
      confirmMutation.mutate();
    }
  }, [sessionId, user]);

  const isDigital = productType === "digital";

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="font-display text-3xl text-primary" data-testid="text-order-success">
              Order Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {confirmMutation.isPending ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing your order...</span>
              </div>
            ) : confirmMutation.isError ? (
              <p className="text-muted-foreground">
                Your payment was successful. Your order will be processed shortly.
              </p>
            ) : (
              <p className="text-muted-foreground" data-testid="text-order-message">
                Thank you for your purchase! Your order has been confirmed and is being processed.
              </p>
            )}

            {isDigital ? (
              <div className="bg-card/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Download className="h-5 w-5" />
                  <span className="font-medium">Digital Product</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your digital content will be available in your dashboard.
                </p>
              </div>
            ) : (
              <div className="bg-card/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Physical Product</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your order will be shipped to the address provided during checkout.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Link href="/dashboard">
                <Button className="w-full" data-testid="button-view-orders">
                  View My Orders
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
