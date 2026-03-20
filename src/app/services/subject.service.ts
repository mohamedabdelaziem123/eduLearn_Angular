import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { CreateSubjectDto, UpdateSubjectDto } from '../responses/subject/dto/subject.dto';
import { CreateSubjectResponse, SubjectResponse } from '../responses/subject/entities/subject.entity';
import { CourseResponse } from '../responses/course/entities/course.entity';
import { TeacherResponse } from '../responses/teacher/teacher.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class SubjectService {
    constructor(private http: HttpClient) {}

    // ─── Admin ────────────────────────────────────────────────────────────

    /** POST /subject — Admin creates a new subject */
    create(body: CreateSubjectDto): Observable<IResponse<CreateSubjectResponse>> {
        return this.http.post<IResponse<CreateSubjectResponse>>(
            `${environment.apiUrl}/subject`,
            body
        );
    }

    /** PATCH /subject/:id — Admin updates a subject */
    update(id: string, body: UpdateSubjectDto): Observable<IResponse<SubjectResponse>> {
        return this.http.patch<IResponse<SubjectResponse>>(
            `${environment.apiUrl}/subject/${id}`,
            body
        );
    }

    /** DELETE /subject/:id — Admin deletes a subject */
    delete(id: string): Observable<IResponse<void>> {
        return this.http.delete<IResponse<void>>(
            `${environment.apiUrl}/subject/${id}`
        );
    }

    // ─── Public / Authenticated ───────────────────────────────────────────

    /** GET /subject — List all subjects */
    findAll(): Observable<IResponse<SubjectResponse[]>> {
        return this.http.get<IResponse<SubjectResponse[]>>(
            `${environment.apiUrl}/subject`
        );
    }

    /** GET /subject/:id — Get a single subject */
    findById(id: string): Observable<IResponse<SubjectResponse>> {
        return this.http.get<IResponse<SubjectResponse>>(
            `${environment.apiUrl}/subject/${id}`
        );
    }

    /** GET /subject/:id/courses — Get courses belonging to a subject */
    getCoursesBySubject(subjectId: string): Observable<IResponse<CourseResponse[]>> {
        return this.http.get<IResponse<CourseResponse[]>>(
            `${environment.apiUrl}/subject/${subjectId}/courses`
        );
    }

    /** GET /subject/:id/teachers — Get teachers associated with a subject */
    getTeachersBySubject(id: string): Observable<IResponse<TeacherResponse[]>> {
        return this.http.get<IResponse<TeacherResponse[]>>(
            `${environment.apiUrl}/subject/${id}/teachers`
        );
    }
}
