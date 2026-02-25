"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import { createPost, uploadToCloudinary } from "@/service/api";
import { PostTypeEnum } from "@/types/types";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const POST_TYPES: { value: PostTypeEnum; label: string; description: string }[] = [
  { value: "NOTE", label: "Note", description: "A general observation or thought" },
  { value: "INSIGHT", label: "Insight", description: "A deeper technical insight" },
  {
    value: "HOT_TAKE",
    label: "Hot Take",
    description: "A bold or controversial opinion",
  },
];

export function NoteForm({ open, onOpenChange, onSuccess }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostTypeEnum>("NOTE");
  const [tags, setTags] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";
      if (mediaFile) {
        imageUrl = await uploadToCloudinary(mediaFile);
      }

      await createPost({
        title: title.trim(),
        content: content.trim(),
        postType,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        imageUrl,
      });

      setTitle("");
      setContent("");
      setPostType("NOTE");
      setTags("");
      setMediaFile(null);
      onSuccess();
    } catch (err) {
      setError("Failed to create note. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0D0F1E] retro-border rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-pixel text-lg text-green-400">Share a Note</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-green-500/50 hover:text-green-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`px-3 py-2 rounded font-mono text-xs transition-colors ${
                    postType === type.value
                      ? "bg-green-600/30 text-green-400 border border-green-500/50"
                      : "bg-black/40 text-green-500/50 border border-green-500/20 hover:text-green-400"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="What's on your mind?"
              className="w-full px-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 placeholder-green-500/40 focus:outline-none focus:border-green-500/60"
            />
            <div className="text-right text-xs text-green-500/30 mt-1">
              {title.length}/100
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Share your thoughts, experiences, or insights..."
              className="w-full px-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 placeholder-green-500/40 focus:outline-none focus:border-green-500/60 resize-none"
            />
            <div className="text-right text-xs text-green-500/30 mt-1">
              {content.length}/1000
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, nextjs"
              className="w-full px-4 py-2 bg-black/40 border border-green-500/30 rounded-lg font-mono text-sm text-green-300 placeholder-green-500/40 focus:outline-none focus:border-green-500/60"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-green-500/70 mb-2">
              Image (optional)
            </label>
            <label className="flex items-center justify-center w-full px-4 py-4 bg-black/40 border border-dashed border-green-500/30 rounded-lg cursor-pointer hover:border-green-500/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center space-x-2 text-green-500/50">
                <Upload className="w-5 h-5" />
                <span className="font-mono text-sm">
                  {mediaFile ? mediaFile.name : "Click to upload"}
                </span>
              </div>
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-mono bg-red-600/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg text-white font-mono text-sm transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <span>Post Note</span>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
