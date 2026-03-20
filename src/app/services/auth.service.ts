import { Injectable, PLATFORM_ID, inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RefreshTokenDto, logoutDto, signupWithGmailDto, ConfirmEmailOtpBodyDto, SignupBodyDto, LoginBodyDto, SendforgotpasswordDto, VerfiyforgotpasswordDto, resetforgotpasswordDto, sendConfirmEmailOtpBodyDto } from '../responses/auth/dto/auth.dto';
import { environment } from '../enviroment/enviroment';

import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

// ─────────────────────────────────────────────────────────────
// ✏️ Your Google OAuth Client ID
// ─────────────────────────────────────────────────────────────
export const GOOGLE_CLIENT_ID = "24393066473-sg8cp522253nut54l1odoq8ir5h6af86.apps.googleusercontent.com";

// ── localStorage keys ─────────────────────────────────────────
const KEY_ACCESS = environment.tokenKey;
const KEY_REFRESH = environment.refreshTokenKey;
const KEY_ROLE = environment.roleKey;

// ── Request / Response shapes ─────────────────────────────────

export interface LoginResponse {
  message: string;
  status: number;
  data: {
    credentials: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface JwtPayload {
  sub: string;
  jti: string;
  role: string;
  iat: number;
  exp: number;
}

//okay now i added a responses folder having interfaces , enums and the dtos and entites for my nest project for you to explore it i will send you the controller for each module to create an angular service to fetch these apis do not remove any api from the existing service if it does not exist in the controller iam sending okay 

// Extend Window so TypeScript knows about the GIS global
declare global {
  interface Window { google: any; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  /** True only when running in the browser (not during SSR) */
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  // ──────────────────────────────────────────────
  // JWT helpers
  // ──────────────────────────────────────────────

  decodeToken(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    if (!this.isBrowser) return;         // ← SSR guard
    localStorage.setItem(KEY_ACCESS, accessToken);
    localStorage.setItem(KEY_REFRESH, refreshToken);
    const payload = this.decodeToken(accessToken);
    if (payload?.role) {
      localStorage.setItem(KEY_ROLE, payload.role);
      console.log(`✅ Logged in — role: "${payload.role}"`);
    }
  }

  getRole(): string | null {
    if (!this.isBrowser) return null;    // ← SSR guard
    return localStorage.getItem(KEY_ROLE);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;    // ← SSR guard
    return localStorage.getItem(KEY_ACCESS);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    if (!this.isBrowser) return;         // ← SSR guard
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    localStorage.removeItem(KEY_ROLE);
    this.router.navigate(['/login']);
  }

  // ──────────────────────────────────────────────
  // SIGN UP  →  POST /auth/signup
  // ──────────────────────────────────────────────
  signup(payload: SignupBodyDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, payload);
  }

  // ──────────────────────────────────────────────
  // LOGIN  →  POST /auth/login
  // ──────────────────────────────────────────────
  login(payload: LoginBodyDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((res) => {
        const { access_token, refresh_token } = res.data.credentials;
        this.storeTokens(access_token, refresh_token);
      })
    );
  }

  // ──────────────────────────────────────────────
  // GOOGLE SIGN-IN/UP  →  POST /auth/signupWithGmail
  // ──────────────────────────────────────────────
  signupWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signupWithGmail`, { idToken });
  }

  // ──────────────────────────────────────────────
  // PASSWORD RESET FLOW
  // ──────────────────────────────────────────────
  sendForgotPassword(payload: SendforgotpasswordDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/send-forgot-password`, payload);
  }

  verifyForgotPassword(payload: VerfiyforgotpasswordDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/verfiy-forgot-password`, payload);
  }

  resetForgotPassword(payload: resetforgotpasswordDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-forgot-password`, payload);
  }

  resendConfirmEmail(payload: sendConfirmEmailOtpBodyDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-confirm-email`, payload);
  }
  resendForgotPassword(payload: sendConfirmEmailOtpBodyDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend-forgot-password`, payload);
  }

  // --- Password Reset Flow Local State ---
  setResetState(email: string, verified: boolean): void {
    try {
      localStorage.setItem('reset_email', email);
      localStorage.setItem('otp_verified', String(verified));
    } catch (e) { }
  }

  getResetState(): { email: string | null, verified: boolean } {
    try {
      return {
        email: localStorage.getItem('reset_email'),
        verified: localStorage.getItem('otp_verified') === 'true'
      };
    } catch (e) {
      return { email: null, verified: false };
    }
  }

  clearResetState(): void {
    try {
      localStorage.removeItem('reset_email');
      localStorage.removeItem('otp_verified');
    } catch (e) { }
  }

  // ──────────────────────────────────────────────
  // REFRESH TOKEN
  // ──────────────────────────────────────────────
  refresh(): Observable<any> {
    if (!this.isBrowser) return new Observable();
    const refreshToken = localStorage.getItem(KEY_REFRESH);
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {}, {
      headers: new HttpHeaders({ Authorization: `Bearer ${refreshToken}` })
    });
  }


  // ──────────────────────────────────────────────
  // LOGOUT (Backend)
  // ──────────────────────────────────────────────
  logoutBackend(payload: logoutDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, payload);
  }

  // ──────────────────────────────────────────────
  // LOGIN WITH GMAIL
  // ──────────────────────────────────────────────
  loginWithGmail(payload: signupWithGmailDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/loginWithGmail`, payload);
  }

  // ──────────────────────────────────────────────
  // CONFIRM EMAIL
  // ──────────────────────────────────────────────
  confirmEmail(payload: ConfirmEmailOtpBodyDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/confirm-email`, payload);
  }


  // ──────────────────────────────────────────────
  // GOOGLE IDENTITY SERVICES (browser only)
  // ──────────────────────────────────────────────

  initGoogle(onSuccess: (credential: string) => void): void {
    if (!this.isBrowser) return;   // ← SSR guard

    const checkGoogle = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(checkGoogle);

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            console.log('Google credential JWT received');
            this.ngZone.run(() => {
              onSuccess(response.credential);
            });
          },
        });
      }
    }, 100);
  }

  signInWithGoogle(): void {
    if (!this.isBrowser || !window.google) return;   // ← SSR guard

    // Use One-Tap prompt; if it's suppressed (e.g. previously dismissed),
    // fall through — the prompt() call is the correct trigger for this flow.
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn('Google One-Tap not displayed:', notification.getNotDisplayedReason?.() ?? notification.getSkippedReason?.());
      }
    });
  }

  handleGoogleCredential(credential: string): void {
    // POST /auth/signupWithGmail  { idToken: <Google JWT> }
    this.signupWithGoogle(credential).subscribe({
      next: (res) => {
        // Store access + refresh tokens, decode & save role
        if (res?.data?.credentials) {
          const { access_token, refresh_token } = res.data.credentials;
          this.storeTokens(access_token, refresh_token);
        }
        // Navigate to home after successful Google sign-in
        this.router.navigate(['/home']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Google sign-in failed';
        console.error('Google sign-in error:', msg);
        // Re-throw so components can show the error message if they want
        throw new Error(msg);
      },
    });
  }
}
