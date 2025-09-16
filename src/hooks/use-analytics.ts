import { useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Simple analytics implementation
// In production, you would integrate with Google Analytics, Mixpanel, etc.
export function useAnalytics() {
  const trackEvent = (event: AnalyticsEvent) => {
    // Only track in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would send to your analytics service
      console.log('Analytics Event:', event);
      
      // Example Google Analytics 4 implementation:
      // if (typeof gtag !== 'undefined') {
      //   gtag('event', event.action, {
      //     event_category: event.category,
      //     event_label: event.label,
      //     value: event.value
      //   });
      // }
    }
  };

  const trackPageView = (page: string) => {
    trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: page
    });
  };

  const trackUserAction = (action: string, category: string, label?: string) => {
    trackEvent({
      action,
      category,
      label
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction
  };
}

// Hook for tracking page views
export function usePageTracking(pageName: string) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}

// Common analytics events
export const AnalyticsEvents = {
  // User actions
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Profile actions
  PROFILE_VIEW: 'profile_view',
  PROFILE_EDIT: 'profile_edit',
  SKILL_ADD: 'skill_add',
  SKILL_REMOVE: 'skill_remove',
  
  // Skill exchange actions
  SKILL_EXCHANGE_REQUEST: 'skill_exchange_request',
  SKILL_EXCHANGE_ACCEPT: 'skill_exchange_accept',
  SKILL_EXCHANGE_REJECT: 'skill_exchange_reject',
  SKILL_EXCHANGE_COMPLETE: 'skill_exchange_complete',
  
  // Messaging actions
  MESSAGE_SEND: 'message_send',
  MESSAGE_VIEW: 'message_view',
  
  // Search and discovery
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  USER_PROFILE_VIEW: 'user_profile_view',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred'
} as const;
