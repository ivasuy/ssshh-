"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { postGossipWithoutPayment } from "@/service/api";

interface GossipPaymentProps {
  title: string;
  content: string;
  isSensitive: boolean;
  visibility: string;
  mediaFile: File | null;
  onSuccess: () => void;
}

export function GossipPayment({
  title,
  content,
  isSensitive,
  visibility,
  mediaFile,
  onSuccess,
}: GossipPaymentProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePostWithoutPayment = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const gossipDetails = {
        id: "",
        title,
        content,
        isSensitive,
        visibility,
        imageUrl: "",
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentId: "",
        userId: "",
        username: "",
        location: {
          city: "",
          state: "",
          country: "",
        },
        reactions: {
          "😂": [],
          "🔥": [],
          "🤯": [],
          "💦": [],
        },
        comments: [],
      };
      await postGossipWithoutPayment(gossipDetails, mediaFile, user);
      onSuccess();
    } catch (error) {
      console.error("Error posting gossip:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handlePostWithoutPayment}
        className={`bg-green-700 w-full hover:bg-green-400 text-green-950 ${
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? "ssshh!!!..." : "Post Your Gossip"}
      </Button>
    </div>
  );
}
