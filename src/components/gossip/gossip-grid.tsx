"use client";

import { useEffect, useState } from "react";
import { GossipCard } from "@/components/gossip/gossip-card";
import { fetchGossipsFromFirestore } from "@/service/api";
import { motion, AnimatePresence } from "framer-motion";
import { GossipType, UserType } from "@/types/types";

interface StoryFeedProps {
  location: string;
  user: UserType;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function GossipGrid({ location, user }: StoryFeedProps) {
  const [stories, setStories] = useState<GossipType[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = fetchGossipsFromFirestore(location, user, setStories);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [location, user]);

  return (
    <motion.div
      className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <AnimatePresence>
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ delay: index * 0.1 }}
          >
            <GossipCard gossip={story} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
