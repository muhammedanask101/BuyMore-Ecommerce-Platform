'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import Link from 'next/link';

type Toast = {
  id: number;
};

type ToastContextType = {
  showAddedToCart: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showAddedToCart() {
    const id = Date.now();
    setToasts((t) => [...t, { id }]);

    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ showAddedToCart }}>
      {children}

      {/* Toast UI */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-4 rounded-lg border-2 border-black
                       bg-white px-4 py-3 shadow-[4px_4px_0_0_#000]"
          >
            <span className="text-sm font-medium">Added to cart</span>

            <Link href="/cart" className="text-sm underline font-medium">
              View cart
            </Link>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
