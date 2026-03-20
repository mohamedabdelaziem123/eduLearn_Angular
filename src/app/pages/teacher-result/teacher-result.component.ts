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

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const state = typeof history !== 'undefined' ? history.state : null;
    if (state && state.student) {
      this.passedStudent = state.student;
      this.passedScore = state.score;
      this.passedPercentage = state.percentage;
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
    this.quizService.getAttemptForTeacher(id).subscribe({
      next: (res: any) => {
        console.log(res, 'attempt');
        
        this.attempt = res?.data || res;
        this.isLoading = false;

        // Force fetch full user object via AdminService now that role guards are cleared
        if (this.attempt?.studentId) {
          this.fetchStudentData(this.attempt.studentId);
        }
      },
      error: (err) => {
        console.error('Error fetching attempt details:', err);
        this.isLoading = false;
      }
    });
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
}
