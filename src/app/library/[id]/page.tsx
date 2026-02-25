"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  GitFork,
  ExternalLink,
  Clock,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import FloatingPaths from "@/components/ui/floating-paths";
import { fetchResourceById } from "@/service/api";
import { ResourceType, PostType } from "@/types/types";

export default function ResourceDetailPage() {
  const params = useParams();
  const [resource, setResource] = useState<ResourceType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResource() {
      if (!params.id) return;

      setLoading(true);
      const data = await fetchResourceById(params.id as string);
      if (data) {
        setResource(data.resource);
        setRelatedPosts(data.relatedPosts);
      }
      setLoading(false);
    }

    loadResource();
  }, [params.id]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0D0F1E] crt flex items-center justify-center">
        <div className="font-mono text-green-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="relative min-h-screen bg-[#0D0F1E] crt flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-green-500 mb-4">Resource not found</p>
          <Link href="/library" className="text-green-400 hover:underline">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0D0F1E] crt">
      <div className="fixed inset-0 z-0">
        <FloatingPaths />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <Link href="/library">
          <motion.button
            className="flex items-center space-x-2 text-green-500/70 hover:text-green-400 mb-6 font-mono text-sm"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-pixel text-xl text-green-400 mb-2">
                {resource.owner}/{resource.repo}
              </h1>
              <p className="font-mono text-green-500/70">{resource.description}</p>
            </div>

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-mono text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-green-500/70 font-mono text-sm">
              <Star className="w-4 h-4" />
              <span>{resource.stars.toLocaleString()} stars</span>
            </div>
            <div className="flex items-center space-x-2 text-green-500/70 font-mono text-sm">
              <GitFork className="w-4 h-4" />
              <span>{resource.forks.toLocaleString()} forks</span>
            </div>
            <div className="flex items-center space-x-2 text-green-500/70 font-mono text-sm">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date(resource.pushedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-500/70 font-mono text-sm">
              <Shield className="w-4 h-4" />
              <span>Health: {resource.healthScore}/100</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {resource.language && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-mono">
                {resource.language}
              </span>
            )}
            {resource.licenseSpdx && (
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-mono">
                {resource.licenseSpdx}
              </span>
            )}
            {resource.isTemplate && (
              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-mono">
                Template
              </span>
            )}
            {resource.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-mono"
              >
                {topic}
              </span>
            ))}
          </div>

          {relatedPosts.length > 0 && (
            <div className="border-t border-green-500/20 pt-6">
              <h2 className="font-pixel text-lg text-green-400 mb-4">
                Community Notes
              </h2>
              <div className="space-y-3">
                {relatedPosts.map((post) => (
                  <div
                    key={post._id}
                    className="p-3 rounded-lg bg-green-600/10 border border-green-500/20"
                  >
                    <p className="font-mono text-green-400 text-sm">{post.title}</p>
                    <p className="font-mono text-green-500/60 text-xs mt-1">
                      {post.content.substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
