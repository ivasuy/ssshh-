"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { postGossipWithoutPayment } from "@/service/api";
import Link from "next/link";

interface GossipPaymentProps {
  title: string;
  content: string;
  isSensitive: boolean;
  visibility: string;
  keyword: string;
  mediaFile: File | null;
  onSuccess: () => void;
}

export function GossipPayment({
  title,
  content,
  isSensitive,
  visibility,
  keyword,
  mediaFile,
  onSuccess,
}: GossipPaymentProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handlePostWithoutPayment = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the terms & conditions to continue.");
      return;
    }

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
          "💀": [],
          "💦": [],
        },
        comments: [],
        keyword,
        isWhispr: true,
      };
      await postGossipWithoutPayment(gossipDetails, mediaFile, user);
      onSuccess();
      setError("");
    } catch (error) {
      console.error("Error posting gossip:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex items-start space-x-2 text-xs text-gray-400">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={() => setAcceptedTerms(!acceptedTerms)}
          className="green-checkbox mt-1"
        />
        <label htmlFor="terms" className="cursor-pointer text-xs sm:text-sm">
          I accept the{" "}
          <Link href="/terms" className="text-green-400 hover:underline">
            Terms & Conditions
          </Link>
          ,{" "}
          <Link href="/content" className="text-green-400 hover:underline">
            Content Policy
          </Link>
          , and{" "}
          <Link href="/privacy" className="text-green-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </label>
      </div>
      <Button
        onClick={handlePostWithoutPayment}
        className={`mt-5 bg-green-700 w-full hover:bg-green-400 text-green-950 ${
          isProcessing || !acceptedTerms ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isProcessing || !acceptedTerms || !title.trim()}
      >
        {isProcessing ? "ssshh!!!..." : "Post Your Gossip"}
      </Button>
    </div>
  );
}
