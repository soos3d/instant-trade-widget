"use client";

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = "Loading accounts..." }: LoadingIndicatorProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent mr-2"></div>
      <span className="text-sm text-gray-400">{message}</span>
    </div>
  );
}
