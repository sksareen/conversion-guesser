'use client';

import { PostHog } from 'posthog-js';
import posthog from 'posthog-js';

export const PHG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const PHG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

// PostHog initialization function for client-side
export const initPostHog = (): PostHog | null => {
  if (typeof window === 'undefined') return null;
  if (!PHG_KEY) return null;

  posthog.init(PHG_KEY, {
    api_host: PHG_HOST,
    capture_pageview: true,
    persistence: 'localStorage',
    autocapture: true,
    capture_pageleave: true,
    disable_session_recording: false,
  });

  return posthog;
};

// Helper function to identify users (if needed)
export const identifyUser = (id: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!PHG_KEY) return;
  
  posthog.identify(id, properties);
};

// Helper function to track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (!PHG_KEY) return;
  
  posthog.capture(eventName, properties);
};

// Export posthog instance for direct use
export default posthog; 