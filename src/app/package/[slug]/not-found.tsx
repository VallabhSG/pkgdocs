import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PackageNotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 bg-slate-50">
      <div className="text-5xl">📦</div>
      <h1 className="text-xl font-bold text-slate-800">Package not found</h1>
      <p className="text-sm text-slate-500">This package doesn&apos;t exist in pkgdocs yet.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all packages
      </Link>
    </div>
  );
}
