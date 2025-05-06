// src/app/services/browser-detector.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserDetectorService {
  
  isInEmbeddedBrowser(): boolean {
    return (
      this.isInAndroidWebView() || 
      this.isInIOSWebView() || 
      this.hasWebViewBridge()
    );
  }

  private isInAndroidWebView(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    // Android WebViews have 'wv' in the user agent
    return /android/.test(ua) && /wv/.test(ua);
  }

  private isInIOSWebView(): boolean {
    if (!this.isIOS()) {
      return false;
    }
    
    const ua = navigator.userAgent.toLowerCase();
    const standalone = (window.navigator as any).standalone === undefined ? 
      false : (window.navigator as any).standalone;
    const isSafari = /safari/.test(ua);
    
    // iOS WebViews typically don't have Safari in the UA string
    // and don't have the standalone property
    return !standalone && !isSafari;
  }

  private hasWebViewBridge(): boolean {
    // Check for common WebView bridge objects injected by apps
    return (
      typeof (window as any).webkit?.messageHandlers !== 'undefined' || 
      typeof (window as any).ReactNativeWebView !== 'undefined' || 
      typeof (window as any).AndroidBridge !== 'undefined' || 
      typeof (window as any).nativeBridge !== 'undefined' ||
      typeof (window as any).postMessage === 'function' && 
      /(FBAN|FBAV|Instagram|Twitter|LinkedInApp)/.test(navigator.userAgent)
    );
  }

  private isIOS(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }
  
  // Get detailed info about the browser environment
  getBrowserInfo(): any {
    const ua = navigator.userAgent;
    const isAndroid = /android/i.test(ua);
    const isIOS = this.isIOS();
    const isMobile = isAndroid || isIOS || /mobile/i.test(ua);
    const isEmbedded = this.isInEmbeddedBrowser();
    
    // Browser detection
    let browserName = 'Unknown';
    if (/MSIE|Trident/.test(ua)) {
      browserName = 'Internet Explorer';
    } else if (/Edg/.test(ua)) {
      browserName = 'Microsoft Edge';
    } else if (/Chrome/.test(ua) && !/Chromium|OPR|Edg/.test(ua)) {
      browserName = 'Google Chrome';
    } else if (/Firefox/.test(ua) && !/Seamonkey/.test(ua)) {
      browserName = 'Mozilla Firefox';
    } else if (/Safari/.test(ua) && !/Chrome|Chromium|OPR|Edg/.test(ua)) {
      browserName = 'Safari';
    } else if (/OPR/.test(ua)) {
      browserName = 'Opera';
    } else if (/Chromium/.test(ua)) {
      browserName = 'Chromium';
    }
    
    // Browser type
    let browserType = 'standard';
    if (isEmbedded) {
      browserType = 'embedded';
      
      // Check for specific app webviews
      if (/(FBAN|FBAV|FB_IAB)/.test(ua)) {
        browserType = 'embedded-facebook';
      } else if (/Instagram/.test(ua)) {
        browserType = 'embedded-instagram';
      } else if (/Twitter/.test(ua)) {
        browserType = 'embedded-twitter';
      } else if (/LinkedIn/.test(ua)) {
        browserType = 'embedded-linkedin';
      }
    }
    
    // Social media app detection
    const isFacebook = /(FBAN|FBAV|FB_IAB)/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isTwitter = /Twitter/i.test(ua);
    const isLinkedIn = /LinkedIn/i.test(ua);
    
    return {
      userAgent: ua,
      browserName,
      browserType,
      isEmbedded,
      platform: {
        isAndroid,
        isIOS,
        isMobile
      },
      apps: {
        isFacebook,
        isInstagram,
        isTwitter,
        isLinkedIn
      },
      details: {
        isAndroidWebView: this.isInAndroidWebView(),
        isIOSWebView: this.isInIOSWebView(),
        hasWebViewBridge: this.hasWebViewBridge()
      }
    };
  }
  
  // Generate a unique session ID to track browser changes
  generateSessionId(): string {
    return 'sid_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Create a state parameter for auth that includes browser info
  createAuthState(): string {
    const browserInfo = this.getBrowserInfo();
    const stateObj = {
      ts: new Date().getTime(),
      ua: browserInfo.userAgent,
      bt: browserInfo.browserType,
      sid: this.generateSessionId()
    };
    
    return btoa(JSON.stringify(stateObj));
  }
  
  // Parse state parameter after auth redirect
  parseAuthState(stateStr: string): any {
    try {
      return JSON.parse(atob(stateStr));
    } catch (e) {
      console.error('Invalid state parameter', e);
      return null;
    }
  }
  
  // Check if browser changed during auth flow
  didBrowserChange(originalState: any): boolean {
    const currentBrowser = this.getBrowserInfo();
    return originalState.ua !== currentBrowser.userAgent;
  }
}
