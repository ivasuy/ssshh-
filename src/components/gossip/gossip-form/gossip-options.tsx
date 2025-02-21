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
}

export function GossipOptions({
  isSensitive,
  setIsSensitive,
  visibility,
  setVisibility,
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
            <SelectItem value="local">Local Area</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="worldwide">Worldwide</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
