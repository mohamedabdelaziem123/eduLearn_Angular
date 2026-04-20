import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { QuizService } from '../../services/quiz.service';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-create-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './create-quiz.component.html'
})
export class CreateQuizComponent implements OnInit {
  quizForm!: FormGroup;
  courseId: string = '';
  lessonId: string = '';
  course: any = null;
  lesson: any = null;
  isSubmitting = false;
  isLoading = true;
  submitSuccess = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private quizService: QuizService,
    private lessonService: LessonService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.lessonId = this.route.snapshot.paramMap.get('lessonId') || '';

    this.initForm();
    this.loadContext();
  }

  initForm(): void {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      timeLimitMinutes: [15, [Validators.required, Validators.min(1), Validators.max(180)]],
      minimumPassScore: [3, [Validators.required, Validators.min(1)]],
      questionsPerLevel: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  loadContext(): void {
    this.isLoading = true;

    // Load course info
    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe({
        next: (res: any) => {
          this.course = res.data?.course || res.Result || res.data || res;
        },
        error: (err) => console.error('Error fetching course', err)
      });
    }

    // Load lesson info
    if (this.lessonId) {
      this.lessonService.getLessonById(this.lessonId).subscribe({
        next: (res: any) => {
          this.lesson = res.data?.lesson || res.Result || res.data || res;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching lesson', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  get f() {
    return this.quizForm.controls;
  }

  /** Computed total questions preview */
  get totalQuestions(): number {
    const qpl = this.quizForm.get('questionsPerLevel')?.value || 0;
    return qpl * 3; // EASY + MEDIUM + HARD
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      Object.values(this.quizForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const payload = {
      ...this.quizForm.value,
      courseId: this.courseId,
      lessonId: this.lessonId || undefined,
    };

    this.quizService.createQuiz(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Navigate back to manage-lesson after a short delay
        setTimeout(() => {
          this.router.navigate(['/manage-lesson', this.courseId]);
        }, 1500);
      },
      error: (err) => {
        console.error('Failed to create quiz', err);
        this.submitError = err?.error?.message || 'Failed to create quiz. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
