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
    <div className="flex items-center gap-2 w-full">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
        <Input className="pl-8" placeholder="Search products" disabled={disabled} />
      </div>
      <Button
        type="button"
        variant="elevated"
        className="size-12 shrink-0 lg:hidden"
        onClick={onOpenFilters}
      >
        <ListFilterIcon />
      </Button>
    </div>
  );
};

export const SearchInputSkeleton = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{
        backgroundColor: '#F5F5F5',
      }}
    >
      <SearchInput disabled />
      <div className="hidden lg:block">
        ,<div className="h-11"></div>
      </div>
    </div>
  );
};
