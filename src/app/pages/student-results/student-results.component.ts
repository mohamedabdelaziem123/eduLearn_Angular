import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CourseService } from '../../services/course.service';
import { QuizService } from '../../services/quiz.service';
import { environment } from '../../enviroment/enviroment';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './student-results.component.html'
})
export class StudentResultsComponent implements OnInit {
  courses: any[] = [];
  selectedCourse: any = null;

  allGrouped: any[] = []; // MyAttemptsGroupedResponse[]
  currentAttempts: any[] = []; // AttemptSummary[] for the selected course

  isLoadingCourses = false;
  isLoadingResults = false;

  constructor(
    private courseService: CourseService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadAttempts();
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.courseService.getMyCourses().subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.courses = Array.isArray(data) ? data : [];
        if (this.courses.length > 0 && !this.selectedCourse) {
          this.selectCourse(this.courses[0]);
        }
        this.isLoadingCourses = false;
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.isLoadingCourses = false;
      }
    });
  }

  loadAttempts(): void {
    this.isLoadingResults = true;
    this.quizService.getMyAttempts().subscribe({
      next: (res: any) => {
        this.allGrouped = res?.data || res || [];
        console.log('[StudentResults] grouped attempts:', this.allGrouped);
        this.filterAttempts();
        this.isLoadingResults = false;
      },
      error: (err) => {
        console.error('Error loading attempts', err);
        this.isLoadingResults = false;
      }
    });
  }

  selectCourse(course: any): void {
    this.selectedCourse = course;
    this.filterAttempts();
  }

  filterAttempts(): void {
    if (!this.selectedCourse || !this.allGrouped?.length) {
      this.currentAttempts = [];
      return;
    }
    const cid = this.selectedCourse._id || this.selectedCourse.id;
    const group = this.allGrouped.find((g: any) => g.courseId === cid);
    this.currentAttempts = group?.attempts || [];
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  getTimeAgo(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
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
