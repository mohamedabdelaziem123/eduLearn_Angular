import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { TeacherService } from '../../services/teacher.service';
import { LessonService } from '../../services/lesson.service';
import { QuizService } from '../../services/quiz.service';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../enviroment/enviroment';

@Component({
  selector: 'app-teacher-quizzes',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './teacher-quizzes.component.html'
})
export class TeacherQuizzesComponent implements OnInit, OnDestroy {
  courses: any[] = [];
  selectedCourse: any = null;

  lessons: any[] = [];
  selectedLesson: any = null;

  studentResults: any[] = [];
  studentProfiles: { [key: string]: any } = {};
  totalResults: number = 0;
  currentResultsPage: number = 1;
  hasMoreResults: boolean = false;

  searchControl = new FormControl('');
  private searchSubscription!: Subscription;

  isLoadingCourses = false;
  isLoadingLessons = false;
  isLoadingResults = false;

  constructor(
    private teacherService: TeacherService,
    private lessonService: LessonService,
    private quizService: QuizService,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.studentResults = [];
      this.currentResultsPage = 1;
      this.loadResults(false);
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

        if (this.courses.length > 0) {
          this.selectCourse(this.courses[0]);
        }
        this.isLoadingCourses = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.isLoadingCourses = false;
      }
    });
  }

  selectCourse(course: any): void {
    const cid = course._id || course.id;
    if ((this.selectedCourse?._id || this.selectedCourse?.id) === cid) return;
    this.selectedCourse = course;
    this.selectedLesson = null;
    this.studentResults = [];
    this.loadLessons(cid);
  }

  loadLessons(courseId: string): void {
    this.isLoadingLessons = true;
    this.lessonService.getLessonsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.lessons = res?.data || [];
        if (this.lessons.length > 0) {
          this.selectLesson(this.lessons[0]);
        }
        this.isLoadingLessons = false;
      },
      error: (err) => {
        console.error('Error fetching lessons', err);
        this.isLoadingLessons = false;
      }
    });
  }

  selectLesson(lesson: any): void {
    const lid = lesson._id || lesson.id;
    if ((this.selectedLesson?._id || this.selectedLesson?.id) === lid) return;
    this.selectedLesson = lesson;
    this.studentResults = [];
    this.currentResultsPage = 1;
    this.loadResults();
  }

  loadResults(append: boolean = false): void {
    if (!this.selectedLesson) return;

    this.isLoadingResults = true;
    const searchVal = this.searchControl.value || '';

    this.quizService.getResultsByLesson(this.selectedLesson._id || this.selectedLesson.id, { page: this.currentResultsPage, size: 4, search: searchVal }).subscribe({
      next: (res: any) => {
        const results = res?.data?.results || [];

        // Hydrate background profiles via AdminService using the Postman-verified schema
        results.forEach((r: any) => {
          const sid = r.student?._id || r.student?.id || r.studentId;
          if (sid && !this.studentProfiles[sid]) {
            this.adminService.getUserDetails(sid).subscribe({
              next: (userRes: any) => {
                this.studentProfiles[sid] = userRes?.data || userRes;
              }
            });
          }
        });

        if (append) {
          this.studentResults = [...this.studentResults, ...results];
        } else {
          this.studentResults = results;
        }

        this.totalResults = res?.data?.totalCount || 0;
        this.hasMoreResults = this.studentResults.length < this.totalResults;
        this.isLoadingResults = false;
      },
      error: (err) => {
        console.error('Error fetching quiz results', err);
        this.isLoadingResults = false;
      }
    });
  }

  loadMoreResults(): void {
    if (this.hasMoreResults && !this.isLoadingResults) {
      this.currentResultsPage++;
      this.loadResults(true);
    }
  }

  // --- Helpers ---

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  getTimeAgo(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();

    // Fallback if Invalid Date
    if (isNaN(date.getTime())) return '';

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return diffInHours === 1 ? `1 hour ago` : `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return diffInDays === 1 ? `1 day ago` : `${diffInDays} days ago`;

    return date.toLocaleDateString();
  }
}
