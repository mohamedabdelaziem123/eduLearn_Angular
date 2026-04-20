import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TeacherService } from '../../../services/teacher.service';
import { LessonService } from '../../../services/lesson.service';
import { QuestionService } from '../../../services/question.service';
import { QuestionType, DifficultyLevel } from '../../../responses/enums';
import { DropdownMenuComponent, DropdownOption } from '../../../components/ui/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-create-question',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, DropdownMenuComponent],
  templateUrl: './create-question.component.html'
})
export class CreateQuestionComponent implements OnInit {
  questionForm!: FormGroup;
  courses: any[] = [];
  lessons: any[] = [];
  
  courseDropdownOptions: DropdownOption[] = [];
  lessonDropdownOptions: DropdownOption[] = [];

  isLoadingCourses = false;
  isLoadingLessons = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private lessonService: LessonService,
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
  }

  initForm(): void {
    this.questionForm = this.fb.group({
      courseId: ['', Validators.required],
      lessonId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      type: [QuestionType.MULTIPLE_CHOICE || 'MULTIPLE_CHOICE'], // default type
      difficulty: [DifficultyLevel.MEDIUM, Validators.required],
      options: this.fb.array([
        this.createOptionFormGroup(),
        this.createOptionFormGroup(),
        this.createOptionFormGroup(),
        this.createOptionFormGroup()
      ])
    });
  }

  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.teacherService.getMyCourses({ page: 1, size: 50, search: '' }).subscribe({
      next: (res: any) => {
        const rawList = res?.data || [];
        this.courses = Array.isArray(rawList) ? rawList : (rawList.courses || rawList.Result || []);
        
        // Preserve stable reference
        this.courseDropdownOptions = this.courses.map(c => ({ value: c._id || c.id, label: c.title }));

        this.isLoadingCourses = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.isLoadingCourses = false;
      }
    });
  }

  onCourseChange(event: any): void {
    const courseId = event.target.value;
    this.questionForm.patchValue({ lessonId: '' });
    this.lessons = [];
    if (courseId) {
      this.loadLessons(courseId);
    }
  }

  onCourseSelectDropdown(courseId: any): void {
    this.questionForm.patchValue({ courseId: courseId, lessonId: '' });
    this.lessons = [];
    if (courseId) {
      this.loadLessons(courseId);
    }
  }

  onLessonSelectDropdown(lessonId: any): void {
    this.questionForm.patchValue({ lessonId: lessonId });
  }

  loadLessons(courseId: string): void {
    this.isLoadingLessons = true;
    this.lessonService.getLessonsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.lessons = res?.data || [];
        
        // Preserve stable reference
        this.lessonDropdownOptions = this.lessons.map(l => ({ value: l._id || l.id, label: l.title }));

        this.isLoadingLessons = false;
      },
      error: (err) => {
        console.error('Error fetching lessons', err);
        this.isLoadingLessons = false;
      }
    });
  }

  setDifficulty(level: string): void {
    this.questionForm.patchValue({ difficulty: level });
  }

  get currentDifficulty(): string {
    return this.questionForm.get('difficulty')?.value;
  }

  toggleCorrectOption(index: number): void {
    // Single choice behavior: Uncheck all other options
    this.options.controls.forEach((control, i) => {
      control.get('isCorrect')?.setValue(i === index);
    });
  }

  onSubmit(): void {
    if (this.questionForm.invalid) {
      this.markFormGroupTouched(this.questionForm);
      return;
    }

    const correctCount = this.options.controls.filter(c => c.get('isCorrect')?.value).length;
    if (correctCount === 0) {
      alert('Please select at least one correct option.');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.questionForm.value;

    this.questionService.createQuestion(formValue).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/questions']);
      },
      error: (err) => {
        console.error('Failed to create question', err);
        alert('Failed to create question. Please check logs.');
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
