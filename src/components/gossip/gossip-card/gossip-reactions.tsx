"use client";

import { useState } from "react";
import { Flame, Laugh, Zap, Droplets, SkullIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { updateGossipReaction } from "@/service/api";
import { GossipType } from "@/types/types";

interface GossipReactionsProps {
  gossip: GossipType;
  initialReactions: {
    "😂": string[];
    "🔥": string[];
    "💀": string[];
    "💦": string[];
  };
  userId: string;
}

const reactionMap = {
  "😂": {
    icon: Laugh,
    gradient:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-green-500",
    solidColor: "text-blue-600",
  },
  "🔥": {
    icon: Flame,
    gradient:
      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-green-500",
    solidColor: "text-orange-600",
  },
  "💀": {
    icon: SkullIcon,
    gradient:
      "radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(234,179,8,0.06) 50%, rgba(202,138,4,0) 100%)",
    iconColor: "text-green-500",
    solidColor: "text-yellow-600",
  },
  "💦": {
    icon: Droplets,
    gradient:
      "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-green-500",
    solidColor: "text-red-600",
  },
};

export function GossipReactions({
  gossip,
  initialReactions,
  userId,
}: GossipReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const { user } = useUser();

  const handleReaction = async (reaction: "😂" | "🔥" | "💀" | "💦") => {
    if (!user) return;
    try {
      await updateGossipReaction(reaction, gossip, user, setReactions);
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
  };

  const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
      },
    },
  };

  const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
  };

  return (
    <motion.div
      className="flex space-x-4 p-2 rounded-lg bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border-border/40 shadow-lg relative overflow-hidden border-4 border-dashed items-center justify-center"
      initial="initial"
      whileHover="hover"
    >
      {(["😂", "🔥", "💀", "💦"] as const).map((reaction) => {
        const {
          icon: Icon,
          gradient,
          iconColor,
          solidColor,
        } = reactionMap[reaction];
        const isSelected = reactions[reaction].includes(userId);

        return (
          <motion.div key={reaction} className="relative">
            <motion.div
              className="block rounded-xl overflow-visible group relative"
              style={{ perspective: "600px" }}
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                variants={glowVariants}
                style={{
                  background: gradient,
                  opacity: 0,
                  borderRadius: "16px",
                }}
              />
              <motion.button
                className={`flex items-center space-x-1 px-4 py-2 bg-transparent group-hover:text-foreground transition-colors rounded-xl ${
                  isSelected ? solidColor : "text-muted-foreground"
                }`}
                variants={itemVariants}
                transition={sharedTransition}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center bottom",
                }}
                onClick={() => handleReaction(reaction)}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? solidColor : iconColor}`}
                />
                <motion.span
                  initial={{ scale: 1 }}
                  animate={isSelected ? { scale: [1, 1.3, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={isSelected ? solidColor : "text-muted-foreground"}
                >
                  {reactions[reaction].length}
                </motion.span>
              </motion.button>
              <motion.button
                className={`flex items-center space-x-1 px-4 py-2 absolute inset-0 bg-transparent group-hover:text-foreground transition-colors rounded-xl ${
                  isSelected ? solidColor : "text-muted-foreground"
                }`}
                variants={backVariants}
                transition={sharedTransition}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center top",
                  rotateX: 90,
                }}
                onClick={() => handleReaction(reaction)}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? solidColor : iconColor}`}
                />
                <motion.span
                  initial={{ scale: 1 }}
                  animate={isSelected ? { scale: [1, 1.3, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={isSelected ? solidColor : "text-muted-foreground"}
                >
                  {reactions[reaction].length}
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
