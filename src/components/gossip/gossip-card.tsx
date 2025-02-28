"use client";

import { Card, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Megaphone,
  Mic,
  Newspaper,
  Users,
  Volume2,
  ShieldAlert,
  Flag,
} from "lucide-react";
import { motion } from "framer-motion";
import { GossipType } from "@/types/types";
import { GossipComments } from "./gossip-card/gossip-comments";
import { GossipReactions } from "./gossip-card/gossip-reactions";
import { useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { reportGossip } from "@/service/api";
import { Disclaimer } from "./gossip-card/disclaimer";

const scaleUp = {
  initial: { scale: 0.95 },
  animate: { scale: 1 },
  hover: { scale: 1.02 },
};

const gossipIcons = [MessageCircle, Megaphone, Mic, Newspaper, Users, Volume2];

export function GossipCard({ gossip }: { gossip: GossipType }) {
  const [isReported, setIsReported] = useState(false);
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const { user } = useUser();

  const RandomIcon = useMemo(
    () => gossipIcons[Math.floor(Math.random() * gossipIcons.length)],
    []
  );

  const handleReport = async () => {
    if (!user) return;
    const result = await reportGossip(gossip.id, user.ip);
    setMessage(result.message);
    if (result.success) setIsReported(true);
    console.log(message);
  };

  return (
    <>
      <motion.div
        className="relative overflow-hidden h-[300px] rounded-lg shadow-md group cursor-pointer"
        variants={scaleUp}
        initial="initial"
        animate="animate"
        whileHover="hover"
        transition={{ duration: 0.2 }}
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none">
          <motion.div
            className="relative h-full flex items-center justify-center bg-gray-900 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {gossip.imageUrl && !imageError ? (
              <img
                src={gossip.imageUrl}
                alt={gossip.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm rounded-lg"
                onError={() => setImageError(true)}
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
      transition-all duration-300 ease-in-out h-[120px] group-hover:h-auto 
      overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent"
          >
            <CardHeader className="p-3 bg-gray-900/80 text-white text-center">
              <motion.h3 className="text-lg font-semibold">
                {gossip.title}
                {gossip.isWhispr && <Disclaimer />}
              </motion.h3>
            </CardHeader>
          </div>

          {gossip.isWhispr && !isReported && (
            <button
              className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center space-x-1 shadow-lg hover:bg-yellow-600"
              onClick={(e) => {
                e.stopPropagation();
                handleReport();
              }}
            >
              <Flag className="h-4 w-4" />
              <span>Report</span>
            </button>
          )}
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-green-500 border-dashed crt">
          <DialogHeader>
            <DialogTitle>{gossip.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p
              className={`text-gray-300 text-sm leading-relaxed transition-all duration-300 
    overflow-y-auto max-h-[100px] scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-transparent 
    ${
      gossip.isSensitive && !showSensitiveContent
        ? "blur-md cursor-pointer hover:blur-none"
        : ""
    }`}
              onClick={() => setShowSensitiveContent(true)}
            >
              {gossip.isSensitive && !showSensitiveContent
                ? "Click to reveal sensitive content..."
                : gossip.content}
            </p>

            <div className="border-t border-gray-600/30 pt-3">
              <GossipReactions
                gossip={gossip}
                initialReactions={gossip.reactions}
                userId={gossip.userId}
              />
            </div>

            <div className="border-t border-gray-600/30 pt-3">
              <GossipComments
                gossip={gossip}
                initialComments={gossip.comments}
              />
            </div>
            {!gossip.isWhispr && (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg shadow-md">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${
                    new URL(gossip.username).hostname
                  }&sz=32`}
                  alt="Source Logo"
                  className="w-5 h-5 rounded-full"
                />
                <a
                  href={gossip.username}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 text-xs font-semibold hover:underline"
                >
                  {gossip.userId}
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
