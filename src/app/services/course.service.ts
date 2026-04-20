import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { IResponse } from '../responses/interfaces/response.interface';
import { StudentCourseResponse } from '../responses/course/entities/course.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class CourseService {
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

    getCourses(page: number = 1, size?: number): Observable<any> {
        const sizeParam = size ? `&size=${size}` : '';
        return this.http.get(`${environment.apiUrl}/course?page=${page}${sizeParam}`, { headers: this.getHeaders() });
    }

    startProgress(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/course/${id}/start-progress`, {}, { headers: this.getHeaders() });
    }

    publishCourse(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/course/${id}/publish`, {}, { headers: this.getHeaders() });
    }

    unpublishCourse(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/course/${id}/unpublish`, {}, { headers: this.getHeaders() });
    }

    archiveCourse(id: string): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/course/${id}/archive`, {}, { headers: this.getHeaders() });
    }

    deleteCourse(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/course/${id}`, { headers: this.getHeaders() });
    }

    getSubjects(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/subject`, { headers: this.getHeaders() });
    }

    getCoursesBySubject(subjectId: string, page: number = 1, size?: number): Observable<any> {
        const sizeParam = size ? `&size=${size}` : '';
        return this.http.get(`${environment.apiUrl}/subject/${subjectId}/courses?page=${page}${sizeParam}`, { headers: this.getHeaders() });
    }

    getCourseById(id: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}/course/${id}`, { headers: this.getHeaders() });
    }

    createCourse(data: FormData): Observable<any> {
        return this.http.post(`${environment.apiUrl}/course/create-course`, data, { headers: this.getHeaders() });
    }

    updateCourse(id: string, data: FormData): Observable<any> {
        return this.http.patch(`${environment.apiUrl}/course/update-course/${id}`, data, { headers: this.getHeaders() });
    }

    getMyCourses(): Observable<IResponse<StudentCourseResponse[]>> {
        return this.http.get<IResponse<StudentCourseResponse[]>>(
            `${environment.apiUrl}/course/my-courses`,
            { headers: this.getHeaders() }
        );
    }
}
