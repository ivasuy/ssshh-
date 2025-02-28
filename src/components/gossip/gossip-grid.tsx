"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GossipCard } from "@/components/gossip/gossip-card";
import { fetchGossips, fetchGossipsFromFirestore } from "@/service/api";
import { motion, AnimatePresence } from "framer-motion";
import { GossipType, UserType } from "@/types/types";
import Btn03 from "../ui/btn03";

interface StoryFeedProps {
  location: string;
  user: UserType;
  keyword: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function GossipGrid({ location, user, keyword }: StoryFeedProps) {
  const [apiStories, setApiStories] = useState<GossipType[]>([]);
  const [firestoreStories, setFirestoreStories] = useState<GossipType[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initialLoadCompleted = useRef(false);

  useEffect(() => {
    if (!user || loading) return;
    const loadInitialStories = async () => {
      setLoading(true);
      const response = await fetchGossips(location, user, keyword);
      if (response && response.articles) {
        setApiStories(response.articles);
        setNextPage(response.nextPage || null);
        initialLoadCompleted.current = true;
      }
      setLoading(false);
    };
    loadInitialStories();
  }, [user, location, keyword]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: (() => void) | undefined;
    const setupFirestoreListener = async () => {
      const unsub = await fetchGossipsFromFirestore(
        location,
        user,
        keyword,
        (newStories) => {
          setFirestoreStories(newStories);
        }
      );
      if (typeof unsub === "function") unsubscribe = unsub;
    };
    setupFirestoreListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [location, user, keyword]);

  const loadMoreApiStories = async (pageCursor?: string) => {
    if (loading) return;
    setLoading(true);
    const response = await fetchGossips(location, user, keyword, pageCursor);
    if (!response || !response.articles) {
      setLoading(false);
      return;
    }
    setApiStories((prev) => [...prev, ...response.articles]);
    setNextPage(response.nextPage || null);
    setLoading(false);
  };

  const allStories = useMemo(() => {
    const firestoreStoryIds = new Set(
      firestoreStories.map((story) => story.id)
    );
    const uniqueApiStories = apiStories.filter(
      (story) => !firestoreStoryIds.has(story.id)
    );
    return [...firestoreStories, ...uniqueApiStories];
  }, [apiStories, firestoreStories]);

  //flex flex-col items-center
  return (
    <div className="container mx-auto px-4 py-6 mb-28 ">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {allStories.map((story, index) => (
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
      {nextPage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="inline-block group relative bg-gradient-to-b from-green-500 to-green-800 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Btn03
              onClick={() => loadMoreApiStories(nextPage)}
              disabled={loading}
              defaultText="Load More"
              hoverText="Push To Load..."
              className="px-6 py-3 text-white font-semibold bg-green-800 rounded-2xl hover:bg-green-500 transition duration-300"
            ></Btn03>
          </div>
        </div>
      )}
    </div>
  );
}
