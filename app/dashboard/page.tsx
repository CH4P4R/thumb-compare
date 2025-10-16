import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Image, Users } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          thumbnails: true,
          competitors: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name || user.email}!</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Thumbnails</p>
              <p className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p._count.thumbnails, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Competitors</p>
              <p className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p._count.competitors, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{project._count.thumbnails} thumbnails</p>
                <p>{project._count.competitors} competitors</p>
                <p>{project._count.members} members</p>
                <p className="text-xs mt-2">Region: {project.regionCode}</p>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No projects yet. Create your first project!</p>
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

