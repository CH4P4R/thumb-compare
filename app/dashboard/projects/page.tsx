import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
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
      owner: true,
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
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your thumbnail comparison projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs text-gray-500">
                {project.ownerId === user.id ? (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Owner</span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Member</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{project._count.thumbnails} thumbnails</p>
              <p>{project._count.competitors} competitors</p>
              <p>{project._count.members} members</p>
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              <p>Region: {project.regionCode}</p>
              <p>Created by: {project.owner.name || project.owner.email}</p>
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
  );
}

