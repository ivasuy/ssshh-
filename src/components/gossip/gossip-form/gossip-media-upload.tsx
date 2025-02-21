"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface GossipMediaUploadProps {
  mediaFile: File | null;
  setMediaFile: (file: File | null) => void;
}

export function GossipMediaUpload({
  mediaFile,
  setMediaFile,
}: GossipMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="media">Media (Optional)</Label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />
      <div
        className="border-2 border-dashed border-green-950 rounded-lg p-4 text-center cursor-pointer hover:border-primary bg-green-700 hover:bg-green-900"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">
          {mediaFile ? mediaFile.name : "Click to upload photo or video"}
        </p>
      </div>
    </div>
  );
}
