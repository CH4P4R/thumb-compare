import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Image, TrendingUp, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">ThumbCompare</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Compare Your Thumbnails
          <br />
          <span className="text-blue-600">Against The Best</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Analyze your YouTube thumbnails against competitors and trending videos.
          Get instant scores and actionable insights to boost your click-through rates.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Create Perfect Thumbnails
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered Scoring</h3>
            <p className="text-gray-600 text-sm">
              Get instant feedback on contrast, brightness, composition and more.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Trending Analysis</h3>
            <p className="text-gray-600 text-sm">
              Compare against top trending videos in your region automatically.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
            <p className="text-gray-600 text-sm">
              Work with your team using comments and annotations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast & Easy</h3>
            <p className="text-gray-600 text-sm">
              Upload, compare, and share in minutes. No design skills needed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Better Thumbnails?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are already optimizing their thumbnails.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600 text-sm">
          <p>© 2025 ThumbCompare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
