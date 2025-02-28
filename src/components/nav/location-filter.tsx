"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  location: string;
  setLocation: (value: string) => void;
}

export function LocationFilter({ location, setLocation }: LocationFilterProps) {
  return (
    <Select value={location} onValueChange={setLocation}>
      <SelectTrigger className="w-full sm:w-[180px] ">
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-green-500 crt">
        {/* <SelectItem value="local">Local Area</SelectItem> */}
        <SelectItem value="city">City</SelectItem>
        <SelectItem value="state">State</SelectItem>
        <SelectItem value="country">Country</SelectItem>
        <SelectItem value="worldwide">Worldwide</SelectItem>
      </SelectContent>
    </Select>
  );
}
