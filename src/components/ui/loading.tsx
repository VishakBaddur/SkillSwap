import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-200/50",
        className
      )}
    />
  );
}

interface UserCardSkeletonProps {
  className?: string;
}

export function UserCardSkeleton({ className }: UserCardSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto sm:mx-0" />
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <Skeleton className="h-3 w-32 mx-auto sm:mx-0" />
            <Skeleton className="h-3 w-40 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

interface StatsSkeletonProps {
  className?: string;
}

export function StatsSkeleton({ className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
} 