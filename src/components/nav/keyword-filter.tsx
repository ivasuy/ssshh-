"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KeywordFilterProps {
  keyword: string;
  setKeyword: (value: string) => void;
}

export function KeywordFilter({ keyword, setKeyword }: KeywordFilterProps) {
  return (
    <Select value={keyword} onValueChange={setKeyword}>
      <SelectTrigger className="w-full sm:w-[180px] ">
        <SelectValue placeholder="Select Topics" />
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
  );
}
