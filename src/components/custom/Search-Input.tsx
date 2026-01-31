'use client';

import { Input } from '@/components/ui/input';
import { ListFilterIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  disabled?: boolean;
  onOpenFilters?: () => void;
}

export const SearchInput = ({ disabled, onOpenFilters }: Props) => {
  return (
    <div className="flex items-center bg-white gap-2 w-full">
      <div className="relative w-full rounded-md bg-gray-100">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input className="pl-8" placeholder="Search products" disabled={disabled} />
      </div>
      <Button
        type="button"
        variant="elevated"
        className="size-9 shrink-0 lg:hidden border border-black"
        onClick={onOpenFilters}
      >
        <ListFilterIcon />
      </Button>
    </div>
  );
};

export const SearchInputSkeleton = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-12 py-4 border-b bg-white">
      <div className="flex items-center gap-2 w-full">
        <div className="relative w-full">
          <div
            className="
              h-10
              w-full
              rounded-md
              bg-gray-100
              animate-pulse
            "
          />
        </div>

        <div
          className="
            h-9 w-9
            shrink-0
            rounded-md
            border border-black/20
            bg-white
            animate-pulse
            lg:hidden
          "
        />
      </div>
    </div>
  );
};
