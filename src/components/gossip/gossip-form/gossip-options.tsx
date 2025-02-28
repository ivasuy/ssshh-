"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GossipOptionsProps {
  isSensitive: boolean;
  setIsSensitive: (value: boolean) => void;
  visibility: string;
  setVisibility: (value: string) => void;
  keyword: string;
  setKeyword: (value: string) => void;
}

export function GossipOptions({
  isSensitive,
  setIsSensitive,
  visibility,
  setVisibility,
  keyword,
  setKeyword,
}: GossipOptionsProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="sensitive"
            checked={isSensitive}
            className=""
            onCheckedChange={setIsSensitive}
          />
          <Label htmlFor="sensitive">Sensitive Content</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Story Visibility</Label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent className="bg-black border-green-500">
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="worldwide">Worldwide</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility">Story Domain</Label>
        <Select value={keyword} onValueChange={setKeyword}>
          <SelectTrigger>
            <SelectValue placeholder="Select Domain" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-green-500 crt">
            <SelectItem value="trending news">Trending News</SelectItem>
            <SelectItem value="corporate">Corporate & Work Culture</SelectItem>
            <SelectItem value="entertainment">
              Entertainment & Celebrity Gossip
            </SelectItem>
            <SelectItem value="politics">Political & Social Issues</SelectItem>
            <SelectItem value="tech">Tech & Startup Insider News</SelectItem>
            <SelectItem value="college">College & University Drama</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
