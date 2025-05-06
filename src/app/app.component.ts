
// src/app/app.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserDetectorService } from './services/browser-detector.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Browser Detector</h1>
      
      <div class="card">
        <h2>Browser Information</h2>
        <div class="browser-info">
          <div class="info-row">
            <span class="label">Browser Type:</span>
            <span class="value" [ngClass]="getBrowserTypeClass()">
              {{ browserInfo.browserType }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Browser Name:</span>
            <span class="value">{{ browserInfo.browserName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Device Type:</span>
            <span class="value">{{ browserInfo.platform?.isMobile ? 'Mobile' : 'Desktop' }}</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>Authentication Simulation</h2>
        <p>This simulates passing user agent data through an authentication flow.</p>
        <button (click)="simulateAuth()" class="btn">Simulate Auth</button>
        
        <div *ngIf="authState" class="auth-state">
          <h3>Auth State (would be passed to auth provider)</h3>
          <pre>{{ displayAuthState }}</pre>
        </div>
        
        <div *ngIf="parsedState" class="auth-result">
          <h3>Auth Result (after redirect)</h3>
          <pre>{{ displayParsedState }}</pre>
          
          <div class="browser-change" *ngIf="browserChanged !== null">
            <h4 [ngClass]="{'changed': browserChanged, 'unchanged': !browserChanged}">
              Browser {{ browserChanged ? 'CHANGED' : 'Unchanged' }} During Auth
            </h4>
            <p *ngIf="browserChanged">
              The user agent during authentication differs from the current user agent.
              This indicates the authentication happened in a different browser.
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>User Agent String</h2>
        <div class="ua-box">
          <p>Copy this value to compare across browsers:</p>
          <pre class="ua-string">{{ browserInfo.userAgent }}</pre>
          <button (click)="copyUserAgent()" class="btn copy-btn">Copy to Clipboard</button>
        </div>
      </div>
      
      <div class="card">
        <h2>How To Test</h2>
        <ol>
          <li>Open this page in different browsers and compare user agent strings</li>
          <li>Click "Simulate Auth" to generate an auth state with current browser info</li>
          <li>Copy the URL from address bar</li>
          <li>Open the URL in a different browser to see browser change detection</li>
          <li>For social media app testing:
            <ul>
              <li>Share this URL on Facebook, Twitter, etc.</li>
              <li>Click the link in those apps to see their embedded browser user agents</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .browser-info {
      margin: 20px 0;
    }
    
    .info-row {
      display: flex;
      margin-bottom: 10px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .label {
      font-weight: bold;
      min-width: 120px;
    }
    
    .value {
      flex: 1;
    }
    
    .value.embedded {
      color: #d32f2f;
      font-weight: bold;
    }
    
    .value.standard {
      color: #388e3c;
    }
    
    .ua-box {
      margin: 20px 0;
    }
    
    .ua-string {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      word-break: break-word;
      white-space: pre-wrap;
      margin: 10px 0;
    }
    
    .btn {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .copy-btn {
      background-color: #757575;
      margin-top: 10px;
    }
    
    .btn:hover {
      opacity: 0.9;
    }
    
    .auth-state, .auth-result {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    pre {
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .browser-change {
      margin-top: 15px;
      padding: 10px;
      border-radius: 4px;
    }
    
    .changed {
      color: #d32f2f;
    }
    
    .unchanged {
      color: #388e3c;
    }
    
    @media (max-width: 600px) {
      .container {
        padding: 10px;
      }
      
      .info-row {
        flex-direction: column;
      }
      
      .label {
        margin-bottom: 5px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  browserInfo: any = {};
  authState: any = null;
  parsedState: any = null;
  browserChanged: boolean | null = null;
  
  displayAuthState: string = '';
  displayParsedState: string = '';

  constructor(
    private browserDetector: BrowserDetectorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.browserInfo = this.browserDetector.getBrowserInfo();
    
    // Check if this is a return from auth simulation
    this.route.queryParams.subscribe(params => {
      if (params['state']) {
        this.parsedState = this.browserDetector.parseAuthState(params['state']);
        this.displayParsedState = JSON.stringify(this.parsedState, null, 2);
        
        if (this.parsedState) {
          this.browserChanged = this.browserDetector.didBrowserChange(this.parsedState);
        }
      }
    });
  }

  getBrowserTypeClass() {
    return {
      'embedded': this.browserInfo.browserType?.includes('embedded'),
      'standard': this.browserInfo.browserType === 'standard'
    };
  }

  simulateAuth() {
    // Create auth state with current browser info
    const state = this.browserDetector.createAuthState();
    this.authState = this.browserDetector.parseAuthState(state);
    this.displayAuthState = JSON.stringify(this.authState, null, 2);
    
    // Redirect to same page with state in URL (simulating auth redirect)
    // In a real app, this would redirect to auth provider
    setTimeout(() => {
      const url = window.location.pathname + '?state=' + state;
      window.location.href = url;
    }, 1500);
  }

  copyUserAgent() {
    navigator.clipboard.writeText(this.browserInfo.userAgent)
      .then(() => {
        alert('User Agent copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }
}

