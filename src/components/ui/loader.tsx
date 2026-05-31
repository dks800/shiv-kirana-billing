import Image from "next/image";

export function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      <div className="logo-loader flex gap-2 flex-col items-center">
        <Image
          src="/images/logo.webp"
          alt="Loading"
          width={120}
          height={120}
          priority
          unoptimized
        />
        <span>Loading...</span>
      </div>
      <style jsx>{`
        .logo-loader {
          animation: logoPulse 1.5s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

export function MiniLoader() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <div className="animate-spin">
        <svg
          className="h-4 w-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}
