'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'center' | 'right';
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hidden?: boolean;
}

export default function Dialog({
  children,
  className,
  description,
  hidden,
  isOpen,
  onClose,
  position,
  title,
}: DialogProps) {
  const cn = {
    center: `
      top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
      animate-in fade-in zoom-in-95 max-w-[calc(100svw-32px)] max-h-[calc(100vh-32px)] w-fit
      data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 rounded-[28px]
    `,
    right: `
      fixed top-0 right-0 z-2102 h-full w-103 rounded-l-lg
      animate-in slide-in-from-right max-w-[calc(100svw-8px)] max-h-svh
      data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right
    `,
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={`animate-in fade-in fixed inset-0 z-2101 bg-[rgba(128,134,139,0.5)] duration-200 ${hidden && 'pointer-events-none opacity-0'}`}
        />
        <RadixDialog.Content
          className={`animate-in fixed z-2102 bg-white shadow-2xl duration-300 outline-none ${cn[position]} ${className} ${hidden && 'pointer-events-none opacity-0'}`}
        >
          <RadixDialog.Title className='sr-only'>{title || 'Modal'}</RadixDialog.Title>
          <RadixDialog.Description className='sr-only'>{description || 'Modal Content'}</RadixDialog.Description>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
