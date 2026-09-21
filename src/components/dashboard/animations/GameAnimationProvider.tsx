'use client';

import { useEffect, ReactNode } from 'react';
import { 
  initializeGameAnimations, 
  cleanupGameAnimations,
  animateCardEntrance,
  animateResourceCounter,
  animateProgressFill,
  animateQueueEntrance,
  createButtonPressAnimation,
  animateToastEntrance,
} from './game-animations';

interface GameAnimationProviderProps {
  children: ReactNode;
}

export function GameAnimationProvider({ children }: GameAnimationProviderProps) {
  useEffect(() => {
    // Initialize global animations
    initializeGameAnimations();
    
    // Return cleanup function
    return () => {
      cleanupGameAnimations();
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * Hook for animating dashboard cards on mount
 */
export function useDashboardCardAnimation(cardsRef: React.RefObject<(HTMLDivElement | null)[]>) {
  useEffect(() => {
    const validCards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
    if (validCards.length === 0) return;
    
    const tl = animateCardEntrance(validCards);
    tl.play();
    
    return () => tl.kill();
  }, [cardsRef]);
}

/**
 * Hook for animating resource counters
 */
export function useResourceCounterAnimation(
  elementRef: React.RefObject<HTMLSpanElement | null>,
  value: number,
  prevValue: number
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    
    // Skip if value hasn't changed significantly
    if (Math.abs(value - prevValue) < 1) return;
    
    const tl = animateResourceCounter(el, prevValue, value);
    tl.play();
    
    return () => tl.kill();
  }, [value, prevValue, elementRef]);
}

/**
 * Hook for animating progress bars
 */
export function useProgressBarAnimation(
  barRef: React.RefObject<HTMLDivElement | null>,
  percent: number,
  prevPercent: number
) {
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    
    // Skip if no significant change
    if (Math.abs(percent - prevPercent) < 0.5) return;
    
    const tl = animateProgressFill(el, prevPercent, percent);
    tl.play();
    
    return () => tl.kill();
  }, [percent, prevPercent, barRef]);
}

/**
 * Hook for queue item animations
 */
export function useQueueAnimation(
  itemsRef: React.RefObject<(HTMLDivElement | null)[]>,
  isNew: boolean = true
) {
  useEffect(() => {
    if (!isNew) return;
    
    const validItems = itemsRef.current.filter((i): i is HTMLDivElement => i !== null);
    if (validItems.length === 0) return;
    
    const tl = animateQueueEntrance(validItems);
    tl.play();
    
    return () => tl.kill();
  }, [isNew, itemsRef]);
}

/**
 * Hook for button press animations
 */
export function useButtonPressAnimation(
  buttonRef: React.RefObject<HTMLButtonElement | null>,
  options: Parameters<typeof createButtonPressAnimation>[1] = {}
) {
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    
    const { press, release } = createButtonPressAnimation(btn, options);
    
    const handleMouseDown = () => press();
    const handleMouseUp = () => release();
    const handleMouseLeave = () => release();
    const handleTouchStart = () => press();
    const handleTouchEnd = () => release();
    
    btn.addEventListener('mousedown', handleMouseDown);
    btn.addEventListener('mouseup', handleMouseUp);
    btn.addEventListener('mouseleave', handleMouseLeave);
    btn.addEventListener('touchstart', handleTouchStart, { passive: true });
    btn.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      btn.removeEventListener('mousedown', handleMouseDown);
      btn.removeEventListener('mouseup', handleMouseUp);
      btn.removeEventListener('mouseleave', handleMouseLeave);
      btn.removeEventListener('touchstart', handleTouchStart);
      btn.removeEventListener('touchend', handleTouchEnd);
    };
  }, [buttonRef, options]);
}

/**
 * Hook for toast notifications
 */
export function useToastAnimation(
  toastRef: React.RefObject<HTMLDivElement | null>,
  isVisible: boolean,
  direction: 'right' | 'left' | 'top' | 'bottom' = 'right'
) {
  useEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    
    const tl = animateToastEntrance(el, { direction });
    
    if (isVisible) {
      tl.play();
    } else {
      tl.reverse();
    }
    
    return () => tl.kill();
  }, [isVisible, direction, toastRef]);
}

/**
 * Hook for sidebar toggle
 */
export function useSidebarAnimation(
  sidebarRef: React.RefObject<HTMLDivElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean
) {
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const content = contentRef.current;
    if (!sidebar || !content) return;
    
    const tl = animateSidebarToggle(sidebar, content, isOpen);
    tl.play();
    
    return () => tl.kill();
  }, [isOpen, sidebarRef, contentRef]);
}

/**
 * Hook for map pin animations
 */
export function useMapPinAnimation(
  pinRef: React.RefObject<HTMLDivElement | null>,
  shouldAnimate: boolean
) {
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || !shouldAnimate) return;
    
    const tl = animateMapPinDrop(pin);
    tl.play();
    
    return () => tl.kill();
  }, [shouldAnimate, pinRef]);
}

export { GAME_ANIMATION_CONFIG } from './game-animations';