import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { GetAllDto } from '../responses/search.dto';
import { CreateQuizDto } from '../responses/quiz/dto/create-quiz.dto';
import { SubmitQuizDto } from '../responses/quiz/dto/submit-quiz.dto';
import { CreateQuizResponse, QuizResponse } from '../responses/quiz/entities/quiz.entity';
import {
    QuizResultPaginatedResponse,
    QuizAttemptDetailResponse,
    MyAttemptsGroupedResponse,
    StartQuizResponse,
    QuizResultResponse,
    LessonPerformanceResponse,
    CoursePerformanceResponse,
} from '../responses/quiz/entities/quiz-result.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class QuizService {
    constructor(private http: HttpClient) {}

    // ═══════════════════════════════════════════════════════════════════════════
    // TEACHER ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /quiz — Teacher creates a new quiz */
    createQuiz(body: CreateQuizDto): Observable<IResponse<CreateQuizResponse>> {
        return this.http.post<IResponse<CreateQuizResponse>>(
            `${environment.apiUrl}/quiz`,
            body
        );
    }

    /** DELETE /quiz/:id — Teacher deletes a quiz */
    // deleteQuiz(quizId: string): Observable<IResponse<void>> {
    //     return this.http.delete<IResponse<void>>(
    //         `${environment.apiUrl}/quiz/${quizId}`
    //     );
    // }

    /** PATCH /quiz/:id/visibility — Teacher hides or unhides a quiz */
    toggleVisibility(quizId: string): Observable<IResponse<QuizResponse>> {
        return this.http.patch<IResponse<QuizResponse>>(
            `${environment.apiUrl}/quiz/${quizId}/visibility`,
            {}
        );
    }

    /** GET /quiz/results/lesson/:lessonId — Teacher views paginated student results for a lesson */
    getResultsByLesson(lessonId: string, query: GetAllDto): Observable<IResponse<QuizResultPaginatedResponse>> {
        const params = this.toHttpParams(query);
        return this.http.get<IResponse<QuizResultPaginatedResponse>>(
            `${environment.apiUrl}/quiz/results/lesson/${lessonId}`,
            { params }
        );
    }

    /** GET /quiz/results/course/:courseId — Teacher views paginated student results for a course */
    getResultsByCourse(courseId: string, query: GetAllDto): Observable<IResponse<QuizResultPaginatedResponse>> {
        const params = this.toHttpParams(query);
        return this.http.get<IResponse<QuizResultPaginatedResponse>>(
            `${environment.apiUrl}/quiz/results/course/${courseId}`,
            { params }
        );
    }

    /** GET /quiz/results/attempt/:attemptId — Teacher views full detail of a student's attempt */
    getAttemptForTeacher(attemptId: string): Observable<IResponse<QuizAttemptDetailResponse>> {
        return this.http.get<IResponse<QuizAttemptDetailResponse>>(
            `${environment.apiUrl}/quiz/results/attempt/${attemptId}`
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STUDENT ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════════

    /** GET /quiz/my-attempts — Student sees all their attempts grouped by course */
    getMyAttempts(): Observable<IResponse<MyAttemptsGroupedResponse[]>> {
        return this.http.get<IResponse<MyAttemptsGroupedResponse[]>>(
            `${environment.apiUrl}/quiz/my-attempts`
        );
    }

    /** GET /quiz/:id/start — Student starts a quiz (answers are hidden!) */
    startQuiz(quizId: string): Observable<IResponse<StartQuizResponse>> {
        return this.http.get<IResponse<StartQuizResponse>>(
            `${environment.apiUrl}/quiz/${quizId}/start`
        );
    }

    /** POST /quiz/:id/submit — Student submits answers and gets graded */
    submitQuiz(quizId: string, body: SubmitQuizDto): Observable<IResponse<QuizResultResponse>> {
        return this.http.post<IResponse<QuizResultResponse>>(
            `${environment.apiUrl}/quiz/${quizId}/submit`,
            body
        );
    }

    /** GET /quiz/attempt/:attemptId — Student views graded attempt (correct answers shown!) */
    getAttempt(attemptId: string): Observable<IResponse<QuizAttemptDetailResponse>> {
        return this.http.get<IResponse<QuizAttemptDetailResponse>>(
            `${environment.apiUrl}/quiz/attempt/${attemptId}`
        );
    }

    /** GET /quiz/performance/lesson/:lessonId — Student's lesson score vs. average */
    getLessonPerformance(lessonId: string): Observable<IResponse<LessonPerformanceResponse>> {
        return this.http.get<IResponse<LessonPerformanceResponse>>(
            `${environment.apiUrl}/quiz/performance/lesson/${lessonId}`
        );
    }

    /** GET /quiz/performance/course/:courseId — Student's course score vs. average */
    getCoursePerformance(courseId: string): Observable<IResponse<CoursePerformanceResponse>> {
        return this.http.get<IResponse<CoursePerformanceResponse>>(
            `${environment.apiUrl}/quiz/performance/course/${courseId}`
        );
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private toHttpParams(query: GetAllDto): HttpParams {
        let params = new HttpParams();
        if (query.page) params = params.set('page', query.page.toString());
        if (query.size) params = params.set('size', query.size.toString());
        if (query.search) params = params.set('search', query.search);
        return params;
    }
}
