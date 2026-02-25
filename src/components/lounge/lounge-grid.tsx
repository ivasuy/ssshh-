"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { fetchPosts, addReaction, addComment } from "@/service/api";
import { PostType } from "@/types/types";
import { useAuth } from "@/context/AuthContext";

const REACTION_EMOJIS = ["✅", "🔥", "🔖", "⚠️", "💀"] as const;

const REACTION_LABELS: Record<(typeof REACTION_EMOJIS)[number], string> = {
  "✅": "Works",
  "🔥": "Used",
  "🔖": "Saved",
  "⚠️": "Outdated",
  "💀": "Breaking",
};

interface LoungeGridProps {
  postTypeFilter?: string;
}

export function LoungeGrid({ postTypeFilter }: LoungeGridProps = {}) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    loadPosts(1);
  }, [postTypeFilter]);

  async function loadPosts(pageNum: number) {
    setLoading(true);
    const result = await fetchPosts({ page: pageNum, limit: 20, postType: postTypeFilter });

    if (pageNum === 1) {
      setPosts(result.items);
    } else {
      setPosts((prev) => [...prev, ...result.items]);
    }

    setHasMore(result.hasMore);
    setPage(pageNum);
    setLoading(false);
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handleReaction = async (
    postId: string,
    reaction: (typeof REACTION_EMOJIS)[number]
  ) => {
    if (!user) return;

    try {
      const newReactions = await addReaction(postId, reaction);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, reactions: newReactions as unknown as PostType["reactions"] } : p
        )
      );
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      await addComment(postId, newComment);
      setNewComment("");
      loadPosts(1);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const getReactionCount = (reactions: PostType["reactions"], emoji: string) => {
    return reactions[emoji as keyof typeof reactions]?.length || 0;
  };

  const hasUserReacted = (reactions: PostType["reactions"], emoji: string) => {
    if (!user) return false;
    return reactions[emoji as keyof typeof reactions]?.includes(user._id);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="retro-border rounded-lg p-4 bg-black/40 animate-pulse"
          >
            <div className="h-5 bg-green-600/20 rounded w-3/4 mb-3" />
            <div className="h-3 bg-green-600/20 rounded w-full mb-2" />
            <div className="h-3 bg-green-600/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
        <p className="font-mono text-green-500/50">No notes yet</p>
        <p className="font-mono text-green-500/30 text-sm mt-2">
          Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="retro-border rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-green-500/20"
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                    post.postType === "HOT_TAKE"
                      ? "bg-red-600/20 text-red-400"
                      : post.postType === "INSIGHT"
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-green-600/20 text-green-400"
                  }`}
                >
                  {post.postType.replace("_", " ")}
                </span>
                <span className="text-xs text-green-500/40 font-mono">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <h3 className="font-mono text-sm text-green-400 mb-2">
                {post.title}
              </h3>

              <p className="font-mono text-xs text-green-300/70 mb-4 line-clamp-3">
                {post.content}
              </p>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-green-600/10 text-green-500/50 rounded text-xs font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-green-500/20 pt-3">
                <div className="flex items-center space-x-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(post._id, emoji)}
                      disabled={!user}
                      title={REACTION_LABELS[emoji]}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                        hasUserReacted(post.reactions, emoji)
                          ? "bg-green-600/30 text-green-400"
                          : "hover:bg-green-600/20 text-green-500/50"
                      } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span>{emoji}</span>
                      <span>{getReactionCount(post.reactions, emoji)}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setExpandedPost(expandedPost === post._id ? null : post._id)
                  }
                  className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-green-500/50 hover:bg-green-600/20 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{post.comments.length}</span>
                </button>
              </div>

              <AnimatePresence>
                {expandedPost === post._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-green-500/20 mt-3 pt-3"
                  >
                    {post.comments.length > 0 && (
                      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                        {post.comments.map((comment, i) => (
                          <div
                            key={i}
                            className="text-xs font-mono p-2 bg-green-600/10 rounded"
                          >
                            <span className="text-green-400">
                              {comment.username}:
                            </span>{" "}
                            <span className="text-green-300/70">
                              {comment.comment}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {user && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 bg-black/40 border border-green-500/30 rounded text-xs font-mono text-green-300 placeholder-green-500/30 focus:outline-none focus:border-green-500/60"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs text-white font-mono transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <motion.button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-mono text-sm border border-green-500/30 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Loading..." : "Load More"}
          </motion.button>
        </div>
      )}
    </>
  );
}
