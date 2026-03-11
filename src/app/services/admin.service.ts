import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASE_URL = 'http://localhost:3000';

@Injectable({
    providedIn: 'root'
})
export class AdminService {

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Fallback to manually passing auth token since we skipped the interceptor
    private getHeaders() {
        let token = this.authService.getAccessToken();




        if (token && token !== 'undefined' && token !== 'null') {
            // Clean up the token just in case it was accidentally stored with quotes
            token = token.replace(/['"]+/g, '');
            // Strip any existing "Bearer " prefix so we don't send "Bearer Bearer eyJ..."
            token = token.replace(/^Bearer\s+/i, '');

            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }

        return new HttpHeaders();
    }

    getStudents(page: number = 1, size: number = 4): Observable<any> {
        let params = new HttpParams()
            .set('size', size.toString())
            .set('page', page.toString());

        return this.http.get(`${BASE_URL}/admin/students`, { headers: this.getHeaders(), params });
    }

    getUserProfile(): Observable<any> {
        return this.http.get(`${BASE_URL}/user/profile`, { headers: this.getHeaders() });
    }

    blockUser(userId: string | number): Observable<any> {
        return this.http.patch(`${BASE_URL}/admin/block/${userId}`, {}, { headers: this.getHeaders() });
    }

    unblockUser(userId: string | number): Observable<any> {
        return this.http.patch(`${BASE_URL}/admin/unblock/${userId}`, {}, { headers: this.getHeaders() });
    }
}
