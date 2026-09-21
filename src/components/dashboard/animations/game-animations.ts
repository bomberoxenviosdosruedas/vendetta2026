'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Game Animation Constants - Pre-calculated for seek-safe determinism
 */
export const GAME_ANIMATION_CONFIG = {
  // Entrance stagger timing
  CARD_STAGGER: 0.08,
  CARD_STAGGER_MAX: 0.5,
  
  // Resource counter animation
  COUNTER_DURATION: 1.2,
  COUNTER_EASE: 'power2.out',
  
  // Progress bar fills
  PROGRESS_FILL_DURATION: 0.8,
  PROGRESS_EASE: 'power2.out',
  
  // Button press
  PRESS_DURATION: 0.06,
  RELEASE_DURATION: 0.3,
  PRESS_SCALE: 0.96,
  RELEASE_EASE: 'back.out(2.5)',
  
  // Sidebar
  SIDEBAR_DURATION: 0.25,
  SIDEBAR_EASE: 'power2.inOut',
  
  // Tooltip
  TOOLTIP_FADE: 0.08,
  TOOLTIP_SCALE: 0.9,
  
  // Notification toast
  TOAST_SLIDE: 0.4,
  TOAST_EASE: 'back.out(1.5)',
  
  // Queue item entrance
  QUEUE_STAGGER: 0.06,
  QUEUE_EASE: 'power2.out',
  
  // Map pin drop
  PIN_DROP_DURATION: 0.4,
  PIN_BOUNCE: 0.15,
  
  // Tab switch
  TAB_TRANSITION: 0.2,
  
  // Modal
  MODAL_FADE: 0.15,
  MODAL_SCALE: 0.95,
} as const;

/**
 * Resource Counter Animation - Counting with dynamic scale
 * Based on: counting-dynamic-scale rule
 */
export function animateResourceCounter(
  element: HTMLElement,
  fromValue: number,
  toValue: number,
  options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { duration = GAME_ANIMATION_CONFIG.COUNTER_DURATION, ease = GAME_ANIMATION_CONFIG.COUNTER_EASE, onComplete } = options;
  
  // Create a proxy object for the numeric value
  const proxy = { value: fromValue };
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  tl.to(proxy, {
    value: toValue,
    duration,
    ease,
    onUpdate: () => {
      // Format with thousands separator
      const formatted = Math.round(proxy.value).toLocaleString('de-DE');
      element.textContent = formatted;
      // Dynamic scale based on value magnitude
      const magnitude = Math.max(1, Math.log10(Math.abs(proxy.value) + 1));
      const scale = 1 + (magnitude - 1) * 0.05;
      element.style.transform = `scale(${Math.min(scale, 1.2)})`;
    },
  });
  
  // Register on window for HyperFrames seek
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Progress Bar Fill Animation - stat-bars-and-fills rule
 */
export function animateProgressFill(
  barElement: HTMLElement,
  fromPercent: number,
  toPercent: number,
  options: {
    duration?: number;
    ease?: string;
    direction?: 'horizontal' | 'vertical';
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.PROGRESS_FILL_DURATION, 
    ease = GAME_ANIMATION_CONFIG.PROGRESS_EASE,
    direction = 'horizontal',
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  if (direction === 'horizontal') {
    // Scale X for horizontal bars
    gsap.set(barElement, { transformOrigin: 'left center', scaleX: fromPercent / 100 });
    tl.to(barElement, {
      scaleX: toPercent / 100,
      duration,
      ease,
      transformOrigin: 'left center',
    });
  } else {
    // Scale Y for vertical bars
    gsap.set(barElement, { transformOrigin: 'center bottom', scaleY: fromPercent / 100 });
    tl.to(barElement, {
      scaleY: toPercent / 100,
      duration,
      ease,
      transformOrigin: 'center bottom',
    });
  }
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Card Spring Pop Entrance - spring-pop-entrance rule
 */
export function animateCardEntrance(
  cards: HTMLElement[],
  options: {
    stagger?: number;
    duration?: number;
    ease?: string;
    fromScale?: number;
    fromY?: number;
    onComplete?: () => void;
  } = {}
) {
  const { 
    stagger = GAME_ANIMATION_CONFIG.CARD_STAGGER, 
    duration = 0.6,
    ease = 'back.out(1.7)',
    fromScale = 0,
    fromY = 30,
    onComplete 
  } = options;
  
  // Cap stagger
  const cappedStagger = Math.min(stagger, GAME_ANIMATION_CONFIG.CARD_STAGGER_MAX / cards.length);
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  tl.fromTo(cards, 
    { 
      scale: fromScale, 
      y: fromY, 
      opacity: 0,
      willChange: 'transform, opacity',
    },
    { 
      scale: 1, 
      y: 0, 
      opacity: 1,
      duration,
      ease,
      stagger: cappedStagger,
      clearProps: 'willChange',
    },
    0
  );
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Button Press-Release Spring - press-release-spring rule
 */
export function createButtonPressAnimation(
  button: HTMLElement,
  options: {
    pressScale?: number;
    pressDuration?: number;
    releaseDuration?: number;
    releaseEase?: string;
    colorShift?: { from: string; to: string };
    shadowDepth?: { from: number; to: number };
  } = {}
) {
  const {
    pressScale = GAME_ANIMATION_CONFIG.PRESS_SCALE,
    pressDuration = GAME_ANIMATION_CONFIG.PRESS_DURATION,
    releaseDuration = GAME_ANIMATION_CONFIG.RELEASE_DURATION,
    releaseEase = GAME_ANIMATION_CONFIG.RELEASE_EASE,
    colorShift,
    shadowDepth,
  } = options;
  
  let pressTl: gsap.core.Timeline | null = null;
  let releaseTl: gsap.core.Timeline | null = null;
  
  const press = () => {
    if (pressTl) pressTl.kill();
    pressTl = gsap.timeline();
    
    pressTl.to(button, {
      scale: pressScale,
      duration: pressDuration,
      ease: 'none',
    }, 0);
    
    if (colorShift) {
      pressTl.to(button, {
        backgroundColor: colorShift.to,
        duration: pressDuration,
        ease: 'none',
      }, 0);
    }
    
    if (shadowDepth) {
      pressTl.to(button, {
        boxShadow: `0 ${shadowDepth.to}px ${shadowDepth.to * 2}px rgba(0,0,0,0.3)`,
        duration: pressDuration,
        ease: 'none',
      }, 0);
    }
  };
  
  const release = () => {
    if (releaseTl) releaseTl.kill();
    releaseTl = gsap.timeline();
    
    releaseTl.to(button, {
      scale: 1,
      duration: releaseDuration,
      ease: releaseEase,
    }, 0);
    
    if (colorShift) {
      releaseTl.to(button, {
        backgroundColor: colorShift.from,
        duration: releaseDuration,
        ease: releaseEase,
      }, 0);
    }
    
    if (shadowDepth) {
      releaseTl.to(button, {
        boxShadow: `0 ${shadowDepth.from}px ${shadowDepth.from * 2}px rgba(0,0,0,0.3)`,
        duration: releaseDuration,
        ease: releaseEase,
      }, 0);
    }
  };
  
  return { press, release };
}

/**
 * Sidebar Toggle Animation - anchored-layout-expand rule
 */
export function animateSidebarToggle(
  sidebar: HTMLElement,
  content: HTMLElement,
  isOpen: boolean,
  options: {
    duration?: number;
    ease?: string;
    sidebarWidth?: number;
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.SIDEBAR_DURATION, 
    ease = GAME_ANIMATION_CONFIG.SIDEBAR_EASE,
    sidebarWidth = 256, // 16rem default
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  if (isOpen) {
    // Opening
    gsap.set(sidebar, { x: -sidebarWidth, visibility: 'visible' });
    gsap.set(content, { x: 0 });
    
    tl.to(sidebar, {
      x: 0,
      duration,
      ease,
    }, 0);
    
    tl.to(content, {
      x: sidebarWidth,
      duration,
      ease,
    }, 0);
  } else {
    // Closing
    tl.to(sidebar, {
      x: -sidebarWidth,
      duration,
      ease,
      onComplete: () => gsap.set(sidebar, { visibility: 'hidden' }),
    }, 0);
    
    tl.to(content, {
      x: 0,
      duration,
      ease,
    }, 0);
  }
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Queue Item Entrance - staggered arrival (waterfall_entry variant)
 */
export function animateQueueEntrance(
  items: HTMLElement[],
  options: {
    stagger?: number;
    duration?: number;
    ease?: string;
    fromX?: number;
    fromOpacity?: number;
    onComplete?: () => void;
  } = {}
) {
  const { 
    stagger = GAME_ANIMATION_CONFIG.QUEUE_STAGGER, 
    duration = 0.4,
    ease = GAME_ANIMATION_CONFIG.QUEUE_EASE,
    fromX = -20,
    fromOpacity = 0,
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  tl.fromTo(items,
    { x: fromX, opacity: fromOpacity, willChange: 'transform, opacity' },
    { 
      x: 0, 
      opacity: 1, 
      duration, 
      ease, 
      stagger,
      clearProps: 'willChange',
    },
    0
  );
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Map Pin Drop Animation
 */
export function animateMapPinDrop(
  pin: HTMLElement,
  options: {
    duration?: number;
    bounceHeight?: number;
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.PIN_DROP_DURATION, 
    bounceHeight = 30,
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  // Set initial state
  gsap.set(pin, { 
    y: -200, 
    scale: 0.5, 
    rotation: -10,
    transformOrigin: 'center bottom',
    opacity: 0,
  });
  
  // Drop with bounce
  tl.to(pin, {
    y: 0,
    scale: 1.1,
    rotation: 0,
    opacity: 1,
    duration: duration * 0.7,
    ease: 'power2.in',
  }, 0);
  
  // Bounce settle
  tl.to(pin, {
    scale: 1,
    y: -bounceHeight,
    duration: duration * 0.15,
    ease: 'power1.out',
  });
  
  tl.to(pin, {
    y: 0,
    duration: duration * 0.15,
    ease: 'back.out(2)',
  });
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Toast/Notification Slide - spring-pop-entrance + nudge
 */
export function animateToastEntrance(
  toast: HTMLElement,
  options: {
    direction?: 'right' | 'left' | 'top' | 'bottom';
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    direction = 'right', 
    duration = GAME_ANIMATION_CONFIG.TOAST_SLIDE, 
    ease = GAME_ANIMATION_CONFIG.TOAST_EASE,
    onComplete 
  } = options;
  
  const offsets: Record<string, { x: number; y: number }> = {
    right: { x: 100, y: 0 },
    left: { x: -100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  };
  
  const { x, y } = offsets[direction];
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  tl.fromTo(toast,
    { x, y, scale: 0.9, opacity: 0, willChange: 'transform, opacity' },
    { 
      x: 0, 
      y: 0, 
      scale: 1, 
      opacity: 1, 
      duration, 
      ease,
      clearProps: 'willChange',
    },
    0
  );
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Tab Switch Transition - scale-swap-transition
 */
export function animateTabSwitch(
  exitingTab: HTMLElement,
  enteringTab: HTMLElement,
  options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.TAB_TRANSITION, 
    ease = 'power2.inOut',
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  // Exit current
  tl.to(exitingTab, {
    scale: 0.95,
    opacity: 0,
    duration: duration * 0.5,
    ease: 'power2.in',
  }, 0);
  
  // Enter new
  gsap.set(enteringTab, { scale: 0.95, opacity: 0 });
  tl.to(enteringTab, {
    scale: 1,
    opacity: 1,
    duration: duration * 0.5,
    ease: 'back.out(2)',
  }, duration * 0.5);
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Modal/Drawer Animation - scale-swap-transition
 */
export function animateModal(
  modal: HTMLElement,
  backdrop: HTMLElement,
  isOpening: boolean,
  options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.MODAL_FADE, 
    ease = 'power2.out',
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  if (isOpening) {
    gsap.set(modal, { scale: GAME_ANIMATION_CONFIG.MODAL_SCALE, opacity: 0 });
    gsap.set(backdrop, { opacity: 0 });
    
    tl.to(backdrop, { opacity: 1, duration, ease }, 0);
    tl.to(modal, { scale: 1, opacity: 1, duration, ease: 'back.out(1.5)' }, 0);
  } else {
    tl.to(modal, { scale: GAME_ANIMATION_CONFIG.MODAL_SCALE, opacity: 0, duration, ease: 'power2.in' }, 0);
    tl.to(backdrop, { opacity: 0, duration, ease }, 0);
  }
  
  // Register
  if (typeof window !== 'undefined') {
    window.__timelines = window.__timelines || [];
    window.__timelines.push(tl);
  }
  
  return tl;
}

/**
 * Tooltip Fade/Scale
 */
export function animateTooltip(
  tooltip: HTMLElement,
  isShowing: boolean,
  options: {
    duration?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) {
  const { 
    duration = GAME_ANIMATION_CONFIG.TOOLTIP_FADE, 
    ease = 'power2.out',
    onComplete 
  } = options;
  
  const tl = gsap.timeline({ paused: true, onComplete });
  
  if (isShowing) {
    gsap.set(tooltip, { scale: GAME_ANIMATION_CONFIG.TOOLTIP_SCALE, opacity: 0 });
    tl.to(tooltip, { scale: 1, opacity: 1, duration, ease: 'back.out(1.5)' }, 0);
  } else {
    tl.to(tooltip, { scale: GAME_ANIMATION_CONFIG.TOOLTIP_SCALE, opacity: 0, duration, ease: 'power2.in' }, 0);
  }
  
  return tl;
}

/**
 * Initialize all game animations on mount
 * Call this in a useEffect in the dashboard layout
 */
export function initializeGameAnimations() {
  // Reduce motion check
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    gsap.globalTimeline.timeScale(0.01);
    return;
  }
  
  // Set global defaults
  gsap.defaults({
    force3D: true,
  });
  
  // Pre-warm common eases
  gsap.parseEase('back.out(1.7)');
  gsap.parseEase('back.out(2.5)');
  gsap.parseEase('power2.out');
  gsap.parseEase('power2.inOut');
}

/**
 * Cleanup all registered timelines
 */
export function cleanupGameAnimations() {
  if (typeof window !== 'undefined' && window.__timelines) {
    window.__timelines.forEach((tl: gsap.core.Timeline) => tl.kill());
    window.__timelines = [];
  }
}

/**
 * React Hook for using game animations in components
 */
export function useGameAnimations() {
  const reduceMotion = useReducedMotion();
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  
  useEffect(() => {
    if (reduceMotion) {
      gsap.globalTimeline.timeScale(0.01);
    }
    
    return () => {
      timelinesRef.current.forEach(tl => tl.kill());
      timelinesRef.current = [];
    };
  }, [reduceMotion]);
  
  const registerTimeline = (tl: gsap.core.Timeline) => {
    timelinesRef.current.push(tl);
    if (typeof window !== 'undefined') {
      window.__timelines = window.__timelines || [];
      window.__timelines.push(tl);
    }
  };
  
  return { registerTimeline };
}

export default {
  animateResourceCounter,
  animateProgressFill,
  animateCardEntrance,
  createButtonPressAnimation,
  animateSidebarToggle,
  animateQueueEntrance,
  animateMapPinDrop,
  animateToastEntrance,
  animateTabSwitch,
  animateModal,
  animateTooltip,
  initializeGameAnimations,
  cleanupGameAnimations,
  useGameAnimations,
  GAME_ANIMATION_CONFIG,
};