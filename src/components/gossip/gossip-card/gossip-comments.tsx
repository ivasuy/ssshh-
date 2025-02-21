"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { addGossipComment } from "@/service/api";

interface GossipCommentsProps {
  gossipId: string;
  initialComments: { userId: string; username: string; comment: string }[];
}

export function GossipComments({
  gossipId,
  initialComments,
}: GossipCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useUser();

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addGossipComment(
        gossipId,
        user,
        newComment,
        setComments,
        setNewComment
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div>
      <AnimatePresence>
        <motion.div className="space-y-3">
          {(isExpanded ? comments : comments.slice(0, 3)).map(
            (comment, index) => (
              <motion.div
                key={index}
                className="relative p-3 bg-[#0D0F1E] border border-green-500 rounded-lg shadow-md flex flex-col"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-retro-green font-bold text-sm">
                  {comment.username} :
                </span>
                <p className="text-sm text-gray-300">{comment.comment}</p>
                <div className="absolute inset-0 rounded-lg border border-green-500 opacity-0 hover:opacity-50 transition duration-300"></div>
              </motion.div>
            )
          )}
        </motion.div>
      </AnimatePresence>
      {comments.length > 3 && (
        <motion.p
          className="text-sm text-green-500 cursor-pointer mt-2 text-center"
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "▲ Show Less" : "▼ View All Comments"}
        </motion.p>
      )}

      <motion.div
        className="flex mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          className="border-none rounded-l px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow bg-transparent"
          placeholder="Add Comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-r bg-primary hover:bg-primary/90 text-green-700 transition-colors"
            onClick={handleComment}
          >
            <MessageCircle className="mr-1" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
