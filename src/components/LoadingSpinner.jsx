"use client";

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          animate-spin
          rounded-full
          border-[#B6D04E]
          border-t-transparent
        `}
      />
    </div>
  );
}

/** Full-page loading overlay */
export function FullPageLoading() {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-[#F0E7D6]
      "
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="font-signika text-[#6E822E] text-lg animate-pulse">
          Memuat...
        </p>
      </div>
    </div>
  );
}
