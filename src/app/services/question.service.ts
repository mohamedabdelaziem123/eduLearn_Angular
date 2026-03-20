import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { CreateQuestionDto } from '../responses/question/dto/create-question.dto';
import { CreateQuestionResponse, QuestionResponse } from '../responses/question/entities/question.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class QuestionService {
    constructor(private http: HttpClient) {}

    /** POST /question — Teacher creates a new question */
    createQuestion(body: CreateQuestionDto): Observable<IResponse<CreateQuestionResponse>> {
        return this.http.post<IResponse<CreateQuestionResponse>>(
            `${environment.apiUrl}/question`,
            body
        );
    }

    /** GET /question/lesson/:lessonId?courseId=xxx — Teacher gets all questions for a lesson */
    getQuestionsByLesson(lessonId: string, courseId: string): Observable<IResponse<QuestionResponse[]>> {
        return this.http.get<IResponse<QuestionResponse[]>>(
            `${environment.apiUrl}/question/lesson/${lessonId}`,
            { params: { courseId } }
        );
    }

    /** DELETE /question/:id — Teacher deletes a question */
    deleteQuestion(questionId: string): Observable<IResponse<void>> {
        return this.http.delete<IResponse<void>>(
            `${environment.apiUrl}/question/${questionId}`
        );
    }
}
