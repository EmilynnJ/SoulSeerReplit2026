import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReaderCardSkeleton() {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <div className="flex justify-center gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="space-y-1">
              <Skeleton className="h-4 w-4 mx-auto" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-4 mx-auto" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-4 mx-auto" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
