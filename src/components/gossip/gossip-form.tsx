"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GossipMediaUpload } from "./gossip-form/gossip-media-upload";
import { GossipInputFields } from "./gossip-form/gossip-input-fields";
import { GossipOptions } from "./gossip-form/gossip-options";
import { GossipPayment } from "./gossip-form/gossip-payment";

interface GossipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GossipForm({ open, onOpenChange }: GossipFormProps) {
  const [isSensitive, setIsSensitive] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("worldwide");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleSuccess = () => {
    setTitle("");
    setContent("");
    setIsSensitive(false);
    setVisibility("worldwide");
    setMediaFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-green-500 border-dashed crt">
        <DialogHeader>
          <DialogTitle>Share Your Gossip</DialogTitle>
        </DialogHeader>
        <form className="space-y-6">
          <GossipMediaUpload
            mediaFile={mediaFile}
            setMediaFile={setMediaFile}
          />
          <GossipInputFields
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
          />
          <GossipOptions
            isSensitive={isSensitive}
            setIsSensitive={setIsSensitive}
            visibility={visibility}
            setVisibility={setVisibility}
          />

          <GossipPayment
            title={title}
            content={content}
            isSensitive={isSensitive}
            visibility={visibility}
            mediaFile={mediaFile}
            onSuccess={handleSuccess}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
