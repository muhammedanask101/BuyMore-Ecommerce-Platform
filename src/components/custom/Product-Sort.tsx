'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ProductSortValue = 'curated' | 'hot_and_new';

interface Props {
  value: ProductSortValue;
  onChange: (value: ProductSortValue) => void;
}

export const ProductSort = ({ value, onChange }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SortButton active={value === 'curated'} onClick={() => onChange('curated')}>
        Curated
      </SortButton>

      <SortButton active={value === 'hot_and_new'} onClick={() => onChange('hot_and_new')}>
        Hot & New
      </SortButton>
    </div>
  );
};

const SortButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onClick}
      className={cn(
        'rounded-full border-2 border-black px-4 font-medium transition-none hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-px hover:-translate-y-px shadow-none',
        active ? 'bg-yellow-400 hover:bg-yellow-400' : 'bg-white border-t hover:bg-white'
      )}
    >
      {children}
    </Button>
  );
};
