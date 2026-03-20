import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { CreateLessonDto, GetUploadUrlDto } from '../responses/lesson/dto/create-lesson.dto';
import { UpdateLessonDto } from '../responses/lesson/dto/update-lesson.dto';
import { CreateLessonResponse, LessonResponse } from '../responses/lesson/entities/lesson.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class LessonService {
    constructor(private http: HttpClient) {}

    // ─── Student / Public Routes ──────────────────────────────────────────

    /** GET /courses/:courseId/lessons — list all lessons in a course */
    getLessonsByCourse(courseId: string): Observable<IResponse<LessonResponse[]>> {
        return this.http.get<IResponse<LessonResponse[]>>(
            `${environment.apiUrl}/courses/${courseId}/lessons`
        );
    }

    /** GET /lessons/:lessonId — get a single lesson */
    getLessonById(lessonId: string): Observable<IResponse<LessonResponse>> {
        return this.http.get<IResponse<LessonResponse>>(
            `${environment.apiUrl}/lessons/${lessonId}`
        );
    }

    /** GET /lessons/:lessonId/stream — get a pre-signed URL to watch the video */
    getStreamUrl(lessonId: string): Observable<IResponse<{ url: string }>> {
        return this.http.get<IResponse<{ url: string }>>(
            `${environment.apiUrl}/lessons/${lessonId}/stream`
        );
    }

    // ─── Teacher Routes ───────────────────────────────────────────────────

    /** POST /teacher/courses/:courseId/lessons/upload-url — get S3 pre-signed upload URL */
    getUploadUrl(courseId: string, body: GetUploadUrlDto): Observable<IResponse<{ URL: string; Key: string }>> {
        return this.http.post<IResponse<{ URL: string; Key: string }>>(
            `${environment.apiUrl}/teacher/courses/${courseId}/lessons/upload-url`,
            body
        );
    }

    /** POST /teacher/courses/:courseId/lessons — create a lesson (after video upload) */
    createLesson(courseId: string, body: CreateLessonDto): Observable<IResponse<CreateLessonResponse>> {
        return this.http.post<IResponse<CreateLessonResponse>>(
            `${environment.apiUrl}/teacher/courses/${courseId}/lessons`,
            body
        );
    }

    /** PATCH /teacher/lessons/:lessonId — update lesson metadata or video */
    updateLesson(lessonId: string, body: UpdateLessonDto): Observable<IResponse<LessonResponse>> {
        return this.http.patch<IResponse<LessonResponse>>(
            `${environment.apiUrl}/teacher/lessons/${lessonId}`,
            body
        );
    }

    /** DELETE /teacher/lessons/:lessonId — delete lesson + S3 video */
    deleteLesson(lessonId: string): Observable<IResponse<void>> {
        return this.http.delete<IResponse<void>>(
            `${environment.apiUrl}/teacher/lessons/${lessonId}`
        );
    }

    /** PATCH /teacher/lessons/:lessonId/visibility — hide or unhide a lesson */
    toggleVisibility(lessonId: string): Observable<IResponse<LessonResponse>> {
        return this.http.patch<IResponse<LessonResponse>>(
            `${environment.apiUrl}/teacher/lessons/${lessonId}/visibility`,
            {}
        );
    }
}
