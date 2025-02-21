"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  MessageCircle,
  Megaphone,
  Mic,
  Newspaper,
  Users,
  Volume2,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import { GossipType } from "@/types/types";
import { GossipComments } from "./gossip-card/gossip-comments";
import { GossipReactions } from "./gossip-card/gossip-reactions";
import { useMemo } from "react";

const scaleUp = {
  initial: { scale: 0.95 },
  animate: { scale: 1 },
  hover: { scale: 1.02 },
};

const gossipIcons = [MessageCircle, Megaphone, Mic, Newspaper, Users, Volume2];

export function GossipCard({ gossip }: { gossip: GossipType }) {
  const RandomIcon = useMemo(
    () => gossipIcons[Math.floor(Math.random() * gossipIcons.length)],
    []
  );
  return (
    <motion.div
      className="relative overflow-hidden h-[300px] rounded-lg shadow-md group"
      variants={scaleUp}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none">
        <motion.div
          className="relative h-full flex items-center justify-center bg-gray-900 rounded-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {gossip.imageUrl ? (
            <img
              src={gossip.imageUrl}
              alt={gossip.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-gray-400">
              <RandomIcon className="w-full h-full object-cover transition-all group-hover:blur-sm rounded-lg animate-pulse" />
              <p className="mt-2 text-sm font-medium">No image available</p>
            </div>
          )}

          {gossip.isSensitive && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-lg">
              <ShieldAlert className="h-4 w-4" />
              <span>Sensitive</span>
            </div>
          )}
        </motion.div>
        <div
          className="absolute bottom-0 left-0 right-0 bg-gray-900/70 backdrop-blur-md 
      transition-all duration-300 ease-in-out h-[120px] group-hover:h-[85%] 
      overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent"
        >
          <div className="relative flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-600/30">
              <motion.h3
                className="text-lg font-semibold line-clamp-2 hover:line-clamp-none cursor-pointer text-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {gossip.title}
              </motion.h3>
            </CardHeader>

            <CardContent className="py-3 relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
              <motion.p
                className="text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-[300px]
            scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {gossip.content}
              </motion.p>
            </CardContent>

            <CardFooter className="py-3">
              <div className="w-full">
                <GossipReactions
                  gossipId={gossip.id}
                  initialReactions={gossip.reactions}
                  userId={gossip.userId}
                />
              </div>
            </CardFooter>

            <CardContent className="pt-3">
              <GossipComments
                gossipId={gossip.id}
                initialComments={gossip.comments}
              />
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
