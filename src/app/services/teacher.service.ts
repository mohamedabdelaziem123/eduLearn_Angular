import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllDto } from '../responses/search.dto';
import { CourseResponse } from '../responses/course/entities/course.entity';
import { AuthService } from './auth.service';

import { environment } from '../enviroment/enviroment';

export interface Teacher {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  provider?: string;
  gender?: string;
  role?: string;
  isBlocked?: boolean;
  profileImage?: string;
  degree?: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  id?: string;
}

export interface TeacherResponse {
  message: string;
  status: number;
  data: Teacher[] | { teachers: Teacher[] };
}

export interface Subject {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  courses?: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SubjectResponse {
  message: string;
  status: number;
  data: {
    subjects: Subject[];
  };
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllTeachers(): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${environment.apiUrl}/teacher`);
  }

  getMyCourses(query: GetAllDto): Observable<any> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.size) params = params.set('size', query.size.toString());
    if (query.search) params = params.set('search', query.search);
    
    return this.http.get(`${environment.apiUrl}/teacher/courses`, { params });
  }

  getMyCourseById(courseId: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${environment.apiUrl}/teacher/courses/${courseId}`);
  }

  getSubjects(): Observable<SubjectResponse> {
    return this.http.get<SubjectResponse>(`${environment.apiUrl}/subject`);
  }

  getTeachersBySubject(subjectId: string): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${environment.apiUrl}/subject/${subjectId}/teachers`);
  }
}
