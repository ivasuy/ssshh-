"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface GossipInputFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
}

export function GossipInputFields({
  title,
  setTitle,
  content,
  setContent,
}: GossipInputFieldsProps) {
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [contentCharCount, setContentCharCount] = useState(0);

  useEffect(() => {
    setTitleCharCount(title.length);
    setContentCharCount(content.length);
  }, [title, content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setTitle(value);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 700) {
      setContent(value);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Story Title</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Give your story a title"
          required
          className="border-dashed border-2"
        />
        <p
          className={`text-sm ${
            titleCharCount > 50 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {titleCharCount}/50 characters
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Story Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="Share your story here..."
          className="min-h-[150px] border-dashed"
          required
        />
        <p
          className={`text-sm ${
            contentCharCount > 700 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {contentCharCount}/700 characters
        </p>
      </div>
    </>
  );
}
