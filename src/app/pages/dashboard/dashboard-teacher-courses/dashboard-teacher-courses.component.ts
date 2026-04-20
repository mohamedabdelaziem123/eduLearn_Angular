import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../enviroment/enviroment';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { TeacherService } from '../../../services/teacher.service';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-dashboard-teacher-courses',
  standalone: true,
  imports: [CommonModule, NavBarComponent, RouterModule],
  templateUrl: './dashboard-teacher-courses.component.html'
})
export class DashboardTeacherCoursesComponent implements OnInit {
  courses: any[] = [];
  
  totalCourses: number = 0;
  totalPublished: number = 0;
  totalInProgress: number = 0;
  
  isLoading: boolean = true;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private teacherService: TeacherService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.fetchTeacherCourses();
  }

  fetchTeacherCourses(): void {
    this.isLoading = true;
    
    if (!isPlatformBrowser(this.platformId)) {
      return; 
    }
    
    // The user requested calling getCoursesByteacher API, which maps to TeacherService.getMyCourses
    this.teacherService.getMyCourses({ page: 1, size: 100, search: '' }).subscribe({
      next: (res: any) => {
        console.log(res, 'courses');
        const rawList = res?.data || [];
        this.courses = Array.isArray(rawList) ? rawList : (rawList.courses || rawList.Result || []);
        
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading teacher courses:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalCourses = this.courses.length;
    this.totalPublished = this.courses.filter(c => c.status === 'published' || c.status === 'Published').length;
    this.totalInProgress = this.courses.filter(c => c.status === 'inProgress' || c.status === 'in_progress' || c.status === 'In Progress').length;
  }

  // Fallback icon/color mapping based on subject name
  getSubjectIcon(subjectName: string): any {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('science') || s.includes('computer')) return { icon: 'terminal', bg: 'bg-blue-100', color: 'text-blue-600', hue: 'bg-blue-600' };
    if (s.includes('math')) return { icon: 'calculate', bg: 'bg-rose-100', color: 'text-rose-600', hue: 'bg-rose-600' };
    if (s.includes('chemistry') || s.includes('biology')) return { icon: 'science', bg: 'bg-teal-100', color: 'text-teal-600', hue: 'bg-teal-600' };
    if (s.includes('data')) return { icon: 'bar_chart', bg: 'bg-indigo-100', color: 'text-indigo-600', hue: 'bg-indigo-600' };
    if (s.includes('writing') || s.includes('english')) return { icon: 'edit_document', bg: 'bg-orange-100', color: 'text-orange-600', hue: 'bg-orange-600' };
    return { icon: 'menu_book', bg: 'bg-slate-100', color: 'text-slate-600', hue: 'bg-slate-600' };
  }

  updateCourseStatus(course: any, action: 'publish' | 'unpublish' | 'inProgress'): void {
    let request;
    if (action === 'publish') request = this.courseService.publishCourse(course._id);
    else if (action === 'unpublish') request = this.courseService.unpublishCourse(course._id);
    else request = this.courseService.startProgress(course._id);

    request.subscribe({
      next: () => {
        // Optimistically update the local state
        if (action === 'publish') course.status = 'published';
        else course.status = 'in_progress';
        
        this.calculateStats();
      },
      error: (err) => console.error(`Error ${action}ing course:`, err)
    });
  }

  getImageUrl(image: string | undefined | null): string | null {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `${environment.cdnUrl}/${image}`;
  }
}
