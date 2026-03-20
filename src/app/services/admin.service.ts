import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CreateTeacherDto, GetUsersQueryDto, GetOrdersQueryDto } from '../responses/admin/dto/create-admin.dto';
import { DashboardStatsResponse } from '../responses/admin/entities/admin.entity';


import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AdminService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        let token = this.authService.getAccessToken();

        if (token && token !== 'undefined' && token !== 'null') {
            token = token.replace(/['"]+/g, '');
            token = token.replace(/^Bearer\s+/i, '');

            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }
        return new HttpHeaders();
    }

    private toHttpParams(obj: any): HttpParams {
        let params = new HttpParams();
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value !== undefined && value !== null) {
                params = params.set(key, value.toString());
            }
        });
        return params;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEACHER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    createTeacher(data: CreateTeacherDto): Observable<any> {
        return this.http.post(`${environment.apiUrl}/admin/create-teacher`, data, { headers: this.getHeaders() });
    }


    deleteTeacher(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/admin/teacher/${id}`, { headers: this.getHeaders() });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MANAGER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    createManager(data: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/admin/manager`, data, { headers: this.getHeaders() });
    }

    deleteManager(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/admin/manager/${id}`, { headers: this.getHeaders() });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BLOCK / UNBLOCK
    // ═══════════════════════════════════════════════════════════════════════════

    blockStudent(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/admin/students/${id}/block`, {}, { headers: this.getHeaders() });
    }

    unblockStudent(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/admin/students/${id}/unblock`, {}, { headers: this.getHeaders() });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // USER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    getAllStudents(query: GetUsersQueryDto): Observable<any> {
        const params = this.toHttpParams(query);
        return this.http.get(`${environment.apiUrl}/admin/students`, { params, headers: this.getHeaders() });
    }

    getAllUsers(query: GetUsersQueryDto): Observable<any> {
        const params = this.toHttpParams(query);
        return this.http.get(`${environment.apiUrl}/admin/users`, { params, headers: this.getHeaders() });
    }

    getUserDetails(id: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/admin/users/${id}`, { headers: this.getHeaders() });
    }

    getUserProfile(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/user/profile`, { headers: this.getHeaders() });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ORDERS
    // ═══════════════════════════════════════════════════════════════════════════

    getAllOrders(query: GetOrdersQueryDto): Observable<any> {
        const params = this.toHttpParams(query);
        return this.http.get(`${environment.apiUrl}/admin/orders`, { params, headers: this.getHeaders() });
    }

    getOrderById(id: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/admin/orders/${id}`, { headers: this.getHeaders() });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════════════════════════

    getDashboardStats(): Observable<DashboardStatsResponse> {
        return this.http.get<DashboardStatsResponse>(`${environment.apiUrl}/admin/dashboard-stats`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SUBJECTS (Preserved)
    // ═══════════════════════════════════════════════════════════════════════════

    createSubject(payload: CreateSubjectPayload): Observable<any> {
        return this.http.post(`${environment.apiUrl}/subject`, payload);
    }

    updateSubject(subjectId: string, payload: UpdateSubjectPayload): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/subject/${subjectId}`, payload);
    }

    deleteSubject(subjectId: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/subject/${subjectId}`);
    }
}

export interface CreateTeacherPayload {

    firstName: string;
    lastName: string;
    email: string;
    password: string;
    degree: string;
}

export interface CreateSubjectPayload {
    name: string;
    description: string;
}

export interface UpdateSubjectPayload {
    name: string;
    description: string;
}

