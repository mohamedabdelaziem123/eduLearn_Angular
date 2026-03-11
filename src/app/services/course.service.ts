import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CourseService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAccessToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getCourses(page: number = 1): Observable<any> {
        return this.http.get(`${BASE_URL}/course?page=${page}`, { headers: this.getHeaders() });
    }

    startProgress(id: string): Observable<any> {
        return this.http.patch(`${BASE_URL}/course/${id}/start-progress`, {}, { headers: this.getHeaders() });
    }

    publishCourse(id: string): Observable<any> {
        return this.http.patch(`${BASE_URL}/course/${id}/publish`, {}, { headers: this.getHeaders() });
    }

    unpublishCourse(id: string): Observable<any> {
        return this.http.patch(`${BASE_URL}/course/${id}/unpublish`, {}, { headers: this.getHeaders() });
    }

    archiveCourse(id: string): Observable<any> {
        return this.http.patch(`${BASE_URL}/course/${id}/archive`, {}, { headers: this.getHeaders() });
    }

    deleteCourse(id: string): Observable<any> {
        return this.http.delete(`${BASE_URL}/course/${id}`, { headers: this.getHeaders() });
    }

    getSubjects(): Observable<any> {
        return this.http.get(`${BASE_URL}/subject`, { headers: this.getHeaders() });
    }

    getCoursesBySubject(subjectId: string, page: number = 1): Observable<any> {
        return this.http.get(`${BASE_URL}/subject/${subjectId}/courses?page=${page}`, { headers: this.getHeaders() });
    }

    getCourseById(id: string): Observable<any> {
        return this.http.get(`${BASE_URL}/course/${id}`, { headers: this.getHeaders() });
    }

    createCourse(data: FormData): Observable<any> {
        return this.http.post(`${BASE_URL}/course/create-course`, data, { headers: this.getHeaders() });
    }

    updateCourse(id: string, data: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}/course/update-course/${id}`, data, { headers: this.getHeaders() });
    }
}
