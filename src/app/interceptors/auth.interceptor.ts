import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, filter, switchMap, take, throwError, BehaviorSubject, Observable } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let token = authService.getAccessToken();

  let clonedReq = req;

  if (!req.headers.has('Authorization') && token && token !== 'undefined' && token !== 'null') {
    // Clean up the token just in case it was accidentally stored with quotes
    token = token.replace(/['"]+/g, '');
    // Strip any existing "Bearer " prefix so we don't send "Bearer Bearer eyJ..."
    token = token.replace(/^Bearer\s+/i, '');

    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: any): Observable<HttpEvent<any>> => {
      // If unauthorized, attempt to use refresh token
      if (error instanceof HttpErrorResponse && error.status === 401) {
        
        // Exclude endpoints that shouldn't be refreshed (login & refresh itself)
        if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
          authService.logout();
          return throwError(() => error);
        }

        return handle401Error(clonedReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        
        // Read new tokens coming from the refresh API
        const newAccessToken = res?.data?.credentials?.access_token;
        const newRefreshToken = res?.data?.credentials?.refresh_token;

        if (newAccessToken && newRefreshToken) {
          authService.storeTokens(newAccessToken, newRefreshToken);
          refreshTokenSubject.next(newAccessToken);

          const updatedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`
            }
          });
          return next(updatedReq);
        } else {
          authService.logout();
          return throwError(() => new Error('Refresh token invalid'));
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Queue secondary 401 requests while the refresh token is fetching
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        const updatedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(updatedReq);
      })
    );
  }
}

