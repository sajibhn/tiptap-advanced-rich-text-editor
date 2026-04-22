'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  onFocusOutside?: (e: FocusEvent) => void;
}

const PopoverContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
} | null>(null);

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  return (
    <PopoverContext.Provider value={{ open, onOpenChange, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return <>{children}</>;

  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
  if (asChild) {
    return React.cloneElement(child, {
      ref: (el: HTMLElement | null) => {
        ctx.triggerRef.current = el;
      },
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e as React.MouseEvent<HTMLElement>);
        ctx.onOpenChange(!ctx.open);
      },
    });
  }
  return (
    <button
      ref={ctx.triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={() => ctx.onOpenChange(!ctx.open)}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className,
  align = 'center',
  sideOffset = 4,
  onFocusOutside,
}: PopoverContentProps) {
  const ctx = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx?.open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        ctx.triggerRef.current &&
        !ctx.triggerRef.current.contains(e.target as Node)
      ) {
        ctx.onOpenChange(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.relatedTarget as Node)
      ) {
        onFocusOutside?.(e);
        if (!onFocusOutside) ctx.onOpenChange(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    contentRef.current?.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [ctx?.open, onFocusOutside]);

  if (!ctx?.open) return null;

  const alignClass =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={contentRef}
      className={cn('absolute z-50', alignClass, className)}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
    >
      {children}
    </div>
  );
}
