"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, BookOpen, Briefcase } from "lucide-react";
import Link from "next/link";
import FloatingPaths from "@/components/ui/floating-paths";
import { fetchCardBySlug } from "@/service/api";
import { TechCardType, PostType } from "@/types/types";

export default function CardDetailPage() {
  const params = useParams();
  const [card, setCard] = useState<TechCardType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      if (!params.slug) return;

      setLoading(true);
      const data = await fetchCardBySlug(params.slug as string);
      if (data) {
        setCard(data.card);
        setRelatedPosts(data.relatedPosts);
      }
      setLoading(false);
    }

    loadCard();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0D0F1E] crt flex items-center justify-center">
        <div className="font-mono text-green-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="relative min-h-screen bg-[#0D0F1E] crt flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-green-500 mb-4">Card not found</p>
          <Link href="/cards" className="text-green-400 hover:underline">
            Back to Cards
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

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/cards">
          <motion.button
            className="flex items-center space-x-2 text-green-500/70 hover:text-green-400 mb-6 font-mono text-sm"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cards</span>
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-mono mb-2 inline-block">
                  {card.domain}
                </span>
                <h1 className="font-pixel text-2xl text-green-400">{card.term}</h1>
              </div>
              <div className="text-green-500/50 font-mono text-sm">
                Quality: {card.qualityScore}/100
              </div>
            </div>

            <p className="font-mono text-green-300 text-lg leading-relaxed">
              {card.shortDefinition}
            </p>
          </div>

          {card.useCases.length > 0 && (
            <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-green-400" />
                <h2 className="font-pixel text-lg text-green-400">Use Cases</h2>
              </div>
              <ul className="space-y-2">
                {card.useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-green-500/50 font-mono">{index + 1}.</span>
                    <span className="font-mono text-green-300">{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.whereUsed.length > 0 && (
            <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
              <h2 className="font-pixel text-lg text-green-400 mb-4">Where Used</h2>
              <div className="flex flex-wrap gap-2">
                {card.whereUsed.map((where, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded font-mono text-sm"
                  >
                    {where}
                  </span>
                ))}
              </div>
            </div>
          )}

          {card.interviewQAs.length > 0 && (
            <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-green-400" />
                <h2 className="font-pixel text-lg text-green-400">Interview Questions</h2>
              </div>
              <div className="space-y-4">
                {card.interviewQAs.map((qa, index) => (
                  <div key={index} className="border-l-2 border-green-500/30 pl-4">
                    <p className="font-mono text-green-400 font-semibold mb-2">
                      Q: {qa.question}
                    </p>
                    <p className="font-mono text-green-300/80">A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {card.refs.length > 0 && (
            <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
              <h2 className="font-pixel text-lg text-green-400 mb-4">References</h2>
              <div className="space-y-2">
                {card.refs.map((ref, index) => (
                  <a
                    key={index}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-green-500 hover:text-green-400 font-mono text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">{ref}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="retro-border rounded-lg p-6 bg-black/40 backdrop-blur-sm">
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
