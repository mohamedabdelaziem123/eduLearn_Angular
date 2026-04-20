import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../enviroment/enviroment';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './my-courses.component.html'
})
export class MyCoursesComponent implements OnInit {
  courses: any[] = [];
  recentCourse: any = null;
  enrolledCourses: any[] = [];
  userName: string = 'Student';

  isLoading = true;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.loadProfile();
    this.loadMyCourses();
  }

  loadProfile(): void {
    // Actually using user info for the greeting
    this.adminService.getUserProfile()?.subscribe({
      next: (res: any) => {
        const user = res?.user || res?.data || res;
        this.userName = user?.firstName || user?.name || user?.username || 'Student';
      },
      error: () => {}
    });
  }

  loadMyCourses(): void {
    this.isLoading = true;
    this.courseService.getMyCourses().subscribe({
      next: (res: any) => {
        console.log('[MyCourses] raw API response:', res);
        const data = res?.data || res;
        this.courses = Array.isArray(data) ? data : [];
        console.log('[MyCourses] parsed courses:', this.courses);
        console.log('[MyCourses] first course image:', this.courses[0]?.image);
        
        if (this.courses.length > 0) {
          this.recentCourse = this.courses[0];
          this.enrolledCourses = this.courses.slice(1);
        } else {
          this.recentCourse = null;
          this.enrolledCourses = [];
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading my courses:', err);
        this.isLoading = false;
      }
    });
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://placehold.co/600x400?text=No+Image'; // Fallback image
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/lesson-player', courseId]);
  }
}
