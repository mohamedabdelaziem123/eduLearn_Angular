import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { QuizService } from '../../services/quiz.service';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../enviroment/enviroment';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './take-quiz.component.html'
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  quizId: string | null = null;
  quiz: any = null;
  isLoading = true;
  isSubmitting = false;

  // Taking state
  isReviewing = false;
  timerInterval: any;
  timeLeftSeconds = 0;
  timerDisplay = '00:00';
  answers: { [questionId: string]: string } = {}; // selectedAnswer is option._id or text

  // Review state properties
  attemptId: string | null = null;
  attempt: any = null;
  studentProfile: any = null;

  courseId: string | null = null;
  lessonId: string | null = null;
  
  lessonPerformance: any = null;
  coursePerformance: any = null;

  lessonAvgPercent = 0;
  courseAvgPercent = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('quizId');
      if (this.quizId) {
        this.startQuizSession(this.quizId);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      this.courseId = params.get('courseId');
      this.lessonId = params.get('lessonId');
    });

    this.adminService.getUserProfile().subscribe({
      next: (res: any) => {
        this.studentProfile = res?.data || res?.user || res;
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startQuizSession(id: string): void {
    this.isLoading = true;
    this.quizService.startQuiz(id).subscribe({
      next: (res: any) => {
        this.quiz = res?.data || res;
        this.isLoading = false;
        this.setupTimer();
      },
      error: (err) => {
        console.error('Error starting quiz:', err);
        // If error due to already passed limit or similar, maybe load the best attempt instead?
        // Fallback for demo: just stop spinning
        this.isLoading = false;
        alert('Could not start quiz. Please try again.');
      }
    });
  }

  setupTimer(): void {
    if (!this.quiz?.timeLimitMinutes) return;
    this.timeLeftSeconds = this.quiz.timeLimitMinutes * 60;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeLeftSeconds--;
      this.updateTimerDisplay();

      if (this.timeLeftSeconds <= 0) {
        this.clearTimer();
        this.submitQuiz(true); // Auto-submit
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    if (this.timeLeftSeconds <= 0) {
      this.timerDisplay = '00:00';
      return;
    }
    const m = Math.floor(this.timeLeftSeconds / 60);
    const s = this.timeLeftSeconds % 60;
    this.timerDisplay = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  selectOption(questionId: string, optionId: string): void {
    if (this.isReviewing || this.isSubmitting) return;
    this.answers[questionId] = optionId;
  }

  submitQuiz(isAuto = false): void {
    if ((this.isSubmitting || this.isReviewing) && !isAuto) return;
    if (!this.quizId) return;

    this.isSubmitting = true;
    this.clearTimer();

    const formattedAnswers = Object.keys(this.answers).map(qId => ({
      questionId: qId,
      selectedAnswer: this.answers[qId]
    }));

    this.quizService.submitQuiz(this.quizId, { answers: formattedAnswers }).subscribe({
      next: (res: any) => {
        const result = res?.data || res;
        this.attemptId = result._id || result.id;
        
        if (!this.lessonId && result.lessonId) this.lessonId = result.lessonId;
        if (!this.courseId && result.courseId) this.courseId = result.courseId;

        // Load the review state!
        this.loadReviewAttempt();
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        this.isSubmitting = false;
        alert('Failed to submit quiz.');
      }
    });
  }

  loadReviewAttempt(): void {
    if (!this.attemptId) return;
    this.isLoading = true;
    
    this.quizService.getAttempt(this.attemptId).subscribe({
      next: (res: any) => {
        this.attempt = res?.data || res;
        this.isReviewing = true;
        this.isLoading = false;
        this.isSubmitting = false;

        this.loadMetrics();
      },
      error: (err) => {
        console.error('Error loading attempt review:', err);
        this.isLoading = false;
      }
    });
  }

  loadMetrics(): void {
    if (this.lessonId) {
      this.quizService.getLessonPerformance(this.lessonId).subscribe({
        next: (res: any) => {
          this.lessonPerformance = res?.data || res;
          if (this.lessonPerformance?.lessonAverageScore != null) {
              this.lessonAvgPercent = Math.round(this.lessonPerformance.lessonAverageScore);
              if (this.lessonAvgPercent > 100) this.lessonAvgPercent = 100;
          }
        }
      });
    }
    if (this.courseId) {
      this.quizService.getCoursePerformance(this.courseId).subscribe({
        next: (res: any) => {
          this.coursePerformance = res?.data || res;
          if (this.coursePerformance?.courseAverageScore != null) {
              this.courseAvgPercent = Math.round(this.coursePerformance.courseAverageScore);
              if (this.courseAvgPercent > 100) this.courseAvgPercent = 100;
          }
        }
      });
    }
  }

  // REUSEN FROM TEACHER RESULT

  getStudentInitial(): string {
    return (this.studentProfile?.firstName?.[0] || 'S') + (this.studentProfile?.lastName?.[0] || '');
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  isOptionCorrect(option: any): boolean {
    return option.isCorrect === true;
  }

  hasStudentSelected(option: any, studentAnswerStr: string): boolean {
    return option.text === studentAnswerStr || option._id?.toString() === studentAnswerStr;
  }
}
