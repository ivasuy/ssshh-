"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { db } from "@/lib/firebase";
import {
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  collection,
} from "firebase/firestore";
import { postGossipWithoutPayment, uploadToCloudinary } from "@/service/api";

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
      const gossipDetails = { title, content, isSensitive, visibility };
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
