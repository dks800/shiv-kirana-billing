import Link from "next/link";
import { Home, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm p-6">
        <div className="mb-4 text-6xl font-bold text-slate-200">
          404
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Page Not Found
        </h1>

        <p className="mb-8 text-sm text-slate-500">
          The page you a looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-slate-700 transition hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            Invoices
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Shiv Kairana & Provision Store
        </p>
      </div>
    </div>
  );
}