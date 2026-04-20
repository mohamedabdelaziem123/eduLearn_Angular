import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, filter, switchMap, take, throwError, BehaviorSubject, Observable } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip token attachment for auth endpoints that don't need it
  const isAuthEndpoint = req.url.includes('/auth/login') ||
    req.url.includes('/auth/signup') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/confirm-email') ||
    req.url.includes('/auth/send-forgot-password') ||
    req.url.includes('/auth/verfiy-forgot-password') ||
    req.url.includes('/auth/reset-forgot-password') ||
    req.url.includes('/auth/resend-confirm-email') ||
    req.url.includes('/auth/resend-forgot-password') ||
    req.url.includes('/auth/signupWithGmail') ||
    req.url.includes('/auth/loginWithGmail');

  let clonedReq = req;

  // Only attach access token if not an auth endpoint and no existing Authorization header
  if (!isAuthEndpoint && !req.headers.has('Authorization')) {
    let token = authService.getAccessToken();
    if (token && token !== 'undefined' && token !== 'null') {
      token = token.replace(/['"]+/g, '');
      token = token.replace(/^Bearer\s+/i, '');

      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(clonedReq).pipe(
    catchError((error: any): Observable<HttpEvent<any>> => {
      if (error instanceof HttpErrorResponse && error.status === 401) {

        // Don't attempt refresh for login or refresh endpoints — just logout
        if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
          authService.logout();
          return throwError(() => error);
        }

        // Skip refresh for other auth-only endpoints
        if (isAuthEndpoint) {
          return throwError(() => error);
        }

        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap((res: any) => {
        isRefreshing = false;

        // Try multiple possible response shapes from the backend
        const credentials = res?.data?.credentials || res?.credentials || res?.data || res;
        const newAccessToken = credentials?.access_token;
        const newRefreshToken = credentials?.refresh_token;

        if (newAccessToken) {
          // Store new tokens (refresh token may or may not be returned)
          authService.storeTokens(
            newAccessToken,
            newRefreshToken || authService.getRefreshToken() || ''
          );
          refreshTokenSubject.next(newAccessToken);

          // Retry the original failed request with the new token
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });
          return next(retryReq);
        } else {
          // No valid token in response
          authService.logout();
          return throwError(() => new Error('Refresh failed: no access token received'));
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Another request hit 401 while we're already refreshing — wait for the new token
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        const retryReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(retryReq);
      })
    );
  }
}
