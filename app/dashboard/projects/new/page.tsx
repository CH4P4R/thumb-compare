"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [regionCode, setRegionCode] = useState("TR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, regionCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await response.json();
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-gray-600 mt-1">
          Set up a new thumbnail comparison project
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border shadow-sm space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome Channel"
          />
        </div>

        <div>
          <label htmlFor="regionCode" className="block text-sm font-medium mb-2">
            Region Code <span className="text-red-500">*</span>
          </label>
          <select
            id="regionCode"
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="TR">Turkey (TR)</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="ES">Spain (ES)</option>
            <option value="IT">Italy (IT)</option>
            <option value="BR">Brazil (BR)</option>
            <option value="IN">India (IN)</option>
            <option value="JP">Japan (JP)</option>
            <option value="KR">South Korea (KR)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            This will be used to fetch trending videos for your region
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

