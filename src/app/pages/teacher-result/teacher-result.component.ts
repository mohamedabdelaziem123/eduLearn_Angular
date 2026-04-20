import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { QuizService } from '../../services/quiz.service';
import { AdminService } from '../../services/admin.service';
import { QuizAttemptDetailResponse } from '../../responses/quiz/entities/quiz-result.entity';
import { environment } from '../../enviroment/enviroment';

@Component({
  selector: 'app-teacher-result',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './teacher-result.component.html'
})
export class TeacherResultComponent implements OnInit {
  attemptId: string | null = null;
  attempt: QuizAttemptDetailResponse | any = null;
  isLoading = true;

  passedStudent: any = null;
  passedScore: any = null;
  passedPercentage: any = null;
  passedLessonId: string | null = null;
  passedCourseId: string | null = null;

  // Performance data (student view only)
  lessonPerformance: any = null;
  coursePerformance: any = null;

  lessonAvgPercent: number = 0;
  courseAvgPercent: number = 0;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private adminService: AdminService
  ) {}

  get isStudent(): boolean {
    const role = (localStorage.getItem('user_role') || '').toLowerCase();
    return role === 'student';
  }

  get isTeacher(): boolean {
    const role = (localStorage.getItem('user_role') || '').toLowerCase();
    return role === 'teacher' || role === 'admin';
  }

  ngOnInit(): void {
    const state = typeof history !== 'undefined' ? history.state : null;
    if (state) {
      if (state.student) {
        this.passedStudent = state.student;
        this.passedScore = state.score;
        this.passedPercentage = state.percentage;
      }
      this.passedLessonId = state.lessonId || null;
      this.passedCourseId = state.courseId || null;
    }

    this.route.paramMap.subscribe(params => {
      this.attemptId = params.get('attemptId');
      if (this.attemptId) {
        this.loadAttempt(this.attemptId);
      }
    });
  }

  loadAttempt(id: string): void {
    this.isLoading = true;
    const request$ = this.isTeacher
      ? this.quizService.getAttemptForTeacher(id)
      : this.quizService.getAttempt(id);

    request$.subscribe({
      next: (res: any) => {
        console.log(res, 'attempt');
        
        this.attempt = res?.data || res;
        this.isLoading = false;

        // For teachers, fetch student profile
        if (this.isTeacher && this.attempt?.studentId) {
          this.fetchStudentData(this.attempt.studentId);
        }

        // For students, fetch performance data
        if (this.isStudent) {
          this.loadPerformanceData();
        }
      },
      error: (err) => {
        console.error('Error fetching attempt details:', err);
        this.isLoading = false;
      }
    });
  }

  loadPerformanceData(): void {
    let lessonId = this.attempt?.lessonId || this.passedLessonId;
    let courseId = this.attempt?.courseId || this.passedCourseId;

    console.log(lessonId , 'lessonId');
    console.log(courseId , 'courseId');

    if (typeof lessonId === 'object' && lessonId !== null) {
      lessonId = lessonId._id || lessonId.id;
    }
    if (typeof courseId === 'object' && courseId !== null) {
      courseId = courseId._id || courseId.id;
    }

    if (lessonId) {
      this.quizService.getLessonPerformance(lessonId).subscribe({
        next: (res: any) => {
          this.lessonPerformance = res?.data || res;
          console.log('[Performance] lesson:', this.lessonPerformance);
          if (this.lessonPerformance?.lessonAverageScore != null) {
              this.lessonAvgPercent = Math.round(this.lessonPerformance.lessonAverageScore);
              if (this.lessonAvgPercent > 100) this.lessonAvgPercent = 100;
          }
        },
        error: (err) => console.error('Error loading lesson performance', err)
      });
    }

    if (courseId) {
      this.quizService.getCoursePerformance(courseId).subscribe({
        next: (res: any) => {
          this.coursePerformance = res?.data || res;
          console.log('[Performance] course:', this.coursePerformance);
          if (this.coursePerformance?.courseAverageScore != null) {
              this.courseAvgPercent = Math.round(this.coursePerformance.courseAverageScore);
              if (this.courseAvgPercent > 100) this.courseAvgPercent = 100;
          }
        },
        error: (err) => console.error('Error loading course performance', err)
      });
    }
  }

  fetchStudentData(studentId: string): void {
    this.adminService.getUserDetails(studentId).subscribe({
      next: (res: any) => {
        console.log(res.data, 'profile');
        // Hydrate the passed student manually from the remote payload
        this.passedStudent = res?.data || res;
      },
      error: (err) => {
        console.error('Fallback student fetch failed:', err);
      }
    });
  }

  getStudent(): any {
    // Return router state student first since API only provides studentId loosely
    if (this.passedStudent) return this.passedStudent;
    return this.attempt?.student || this.attempt?.studentId || {};
  }

  getStudentInitial(): string {
    const student = this.getStudent();
    return (student?.firstName?.[0] || 'S') + (student?.lastName?.[0] || '');
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  getDateFormatted(dateString: any): string {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  isOptionCorrect(option: any): boolean {
    return option.isCorrect === true;
  }

  hasStudentSelected(option: any, studentAnswerStr: string): boolean {
    return option.text === studentAnswerStr || option._id?.toString() === studentAnswerStr;
  }

  getScoreDiff(): number {
    return (this.attempt?.percentage || 0) - this.lessonAvgPercent;
  }
}
