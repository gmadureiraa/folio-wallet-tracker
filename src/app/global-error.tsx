"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong.</h2>
            <button
              onClick={reset}
              className="bg-black text-white px-4 py-2 rounded-full text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
