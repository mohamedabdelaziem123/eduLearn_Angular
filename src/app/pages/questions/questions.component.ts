import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { TeacherService } from '../../services/teacher.service';
import { LessonService } from '../../services/lesson.service';
import { QuestionService } from '../../services/question.service';
import { environment } from '../../enviroment/enviroment';
import { DropdownMenuComponent, DropdownOption } from '../../components/ui/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, DropdownMenuComponent],
  templateUrl: './questions.component.html'
})
export class QuestionsComponent implements OnInit, OnDestroy {
  courses: any[] = [];
  selectedCourse: any = null;

  lessons: any[] = [];
  selectedLesson: any = null;

  allQuestions: any[] = []; // Full questions set for the selected lesson
  filteredQuestions: any[] = []; // Local search filtered set

  courseDropdownOptions: DropdownOption[] = [];

  searchControl = new FormControl('');
  private searchSubscription!: Subscription;

  isLoadingCourses = false;
  isLoadingLessons = false;
  isLoadingQuestions = false;

  constructor(
    private teacherService: TeacherService,
    private lessonService: LessonService,
    private questionService: QuestionService
  ) { }

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => {
      this.filterQuestionsLocal(val || '');
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.teacherService.getMyCourses({ page: 1, size: 50, search: '' }).subscribe({
      next: (res: any) => {
        const rawList = res?.data || [];
        this.courses = Array.isArray(rawList) ? rawList : (rawList.courses || rawList.Result || []);
        
        // Preserve stable reference to avoid digest cascades
        this.courseDropdownOptions = this.courses.map(c => ({ value: c._id || c.id, label: c.title }));

        if (this.courses.length > 0) {
          this.selectCourse(this.courses[0]); // Default to first course
        }
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
    const course = this.courses.find(c => (c._id || c.id) === courseId);
    if (course) {
      this.selectCourse(course);
    }
  }

  onCourseSelectDropdown(courseId: any): void {
    const course = this.courses.find(c => (c._id || c.id) === courseId);
    if (course) {
      this.selectCourse(course);
    }
  }

  selectCourse(course: any): void {
    this.selectedCourse = course;
    this.selectedLesson = null;
    this.allQuestions = [];
    this.filteredQuestions = [];
    this.loadLessons(course._id || course.id);
  }

  loadLessons(courseId: string): void {
    this.isLoadingLessons = true;
    this.lessonService.getLessonsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.lessons = res?.data || [];
        if (this.lessons.length > 0) {
          this.selectLesson(this.lessons[0]); // Default to first lesson
        } else {
          this.isLoadingLessons = false;
        }
      },
      error: (err) => {
        console.error('Error fetching lessons', err);
        this.isLoadingLessons = false;
      }
    });
  }

  selectLesson(lesson: any): void {
    this.selectedLesson = lesson;
    this.loadQuestions();
  }

  loadQuestions(): void {
    if (!this.selectedLesson || !this.selectedCourse) return;

    this.isLoadingQuestions = true;
    const cid = this.selectedCourse._id || this.selectedCourse.id;
    const lid = this.selectedLesson._id || this.selectedLesson.id;

    this.questionService.getQuestionsByLesson(lid, cid).subscribe({
      next: (res: any) => {
        this.allQuestions = res?.data || [];
        this.filterQuestionsLocal(this.searchControl.value || '');
        this.isLoadingQuestions = false;
        this.isLoadingLessons = false; // complete lesson selection cascade loading state
      },
      error: (err) => {
        console.error('Error fetching questions', err);
        this.isLoadingQuestions = false;
        this.isLoadingLessons = false;
      }
    });
  }

  filterQuestionsLocal(searchVal: string): void {
    if (!searchVal.trim()) {
      this.filteredQuestions = [...this.allQuestions];
      return;
    }
    const query = searchVal.toLowerCase();
    this.filteredQuestions = this.allQuestions.filter(q => 
      q.title?.toLowerCase().includes(query)
    );
  }

  deleteQuestion(questionId: string): void {
    if (!confirm('Are you sure you want to delete this question?')) return;

    this.questionService.deleteQuestion(questionId).subscribe({
      next: () => {
        // Remove locally to avoid full page payload hit
        this.allQuestions = this.allQuestions.filter(q => (q._id || q.id) !== questionId);
        this.filterQuestionsLocal(this.searchControl.value || '');
      },
      error: (err) => {
        console.error('Failed to delete question', err);
        alert('Failed to delete question. Please try again.');
      }
    });
  }

  // --- Helpers ---
  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }
}
