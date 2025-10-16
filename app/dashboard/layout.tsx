import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Home, FolderKanban, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                ThumbCompare
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm hover:text-blue-600"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="flex items-center gap-2 text-sm hover:text-blue-600"
                >
                  <FolderKanban className="w-4 h-4" />
                  Projects
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">{user.email}</div>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

