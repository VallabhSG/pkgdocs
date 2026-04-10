import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-warm-50 px-6 text-center">
      <p className="text-5xl font-bold text-warm-200 mb-4">404</p>
      <h1 className="text-xl font-bold text-warm-900 mb-2">Package not found</h1>
      <p className="text-warm-500 text-sm mb-8 max-w-xs">
        One or both packages in this comparison don&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        Browse all packages
      </Link>
    </div>
  );
}
