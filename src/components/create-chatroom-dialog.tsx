"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CreateChatRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChatRoomDialog({
  open,
  onOpenChange,
}: CreateChatRoomDialogProps) {
  const [isExclusive, setIsExclusive] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = isExclusive ? 600 : 100;

    // Initialize Razorpay payment
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: price * 100, // amount in paisa
      currency: "INR",
      name: "Anonymous Stories",
      description: `Create ${isExclusive ? "an exclusive" : "a"} chat room`,
      handler: async function (response: any) {
        // Payment successful, create chat room
        try {
          await addDoc(collection(db, "chatrooms"), {
            name,
            description,
            isExclusive,
            createdAt: new Date(),
            paymentId: response.razorpay_payment_id,
            members: [],
            messages: [],
          });
          onOpenChange(false);
        } catch (error) {
          console.error("Error creating chat room:", error);
        }
      },
      prefill: {
        name: "Anonymous User",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Chat Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your chat room..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="exclusive"
                checked={isExclusive}
                onCheckedChange={setIsExclusive}
              />
              <Label htmlFor="exclusive">Exclusive Room</Label>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isExclusive
                ? "Creating an exclusive chat room costs ₹600. Members will need to pay ₹100 to join."
                : "Creating a regular chat room costs ₹100. Anyone can join for free."}
            </p>
            <Button type="submit" className="w-full">
              Pay ₹{isExclusive ? "600" : "100"} & Create Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
