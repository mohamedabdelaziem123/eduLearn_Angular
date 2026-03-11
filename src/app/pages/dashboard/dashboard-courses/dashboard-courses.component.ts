import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { CourseService } from '../../../services/course.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

export interface Course {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  teacherImage?: string;
  status: 'Published' | 'In Progress' | 'Draft' | 'Archived';
  dateCreated: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  rawStatus?: string;
}

@Component({
  selector: 'app-dashboard-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent, SideBarComponent, ClickOutsideDirective],
  templateUrl: './dashboard-courses.component.html',
  styleUrl: './dashboard-courses.component.css'
})
export class DashboardCoursesComponent implements OnInit {
  courses: Course[] = [];
  subjects: any[] = [];
  selectedSubjectId: string = '';
  activeDropdownId: string | null = null;

  // Pagination State
  docCount: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10;
  pagesArray: number[] = [];

  // Stats State
  totalPublished: number = 0;
  totalDraft: number = 0;

  constructor(
    private courseService: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchCourses();
      this.fetchSubjects();
    }
  }

  fetchSubjects() {
    this.courseService.getSubjects().subscribe({
      next: (res) => {
        if (res.data && res.data.subjects) {
          this.subjects = res.data.subjects;
        }
      },
      error: (err) => console.error('Error fetching subjects', err)
    });
  }

  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.currentPage = 1;
    if (!this.selectedSubjectId) {
      this.fetchCourses();
      return;
    }

    this.courseService.getCoursesBySubject(this.selectedSubjectId, this.currentPage).subscribe({
      next: (res) => {
        if (res.data && res.data.courses) {
          this.courses = res.data.courses.map((c: any) => this.mapCourse(c));

          // Fallback if backend doesn't send proper pagination for subject filter yet
          this.docCount = res.data.DocCount || this.courses.length;
          this.totalPages = res.data.pages || 1;
          this.currentPage = res.data.currentPage || this.currentPage;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          this.calculateStats();
        }
      },
      error: (err) => console.error('Error fetching courses by subject', err)
    });
  }

  resetFilters() {
    this.selectedSubjectId = '';
    this.currentPage = 1;
    this.fetchCourses();
  }

  fetchCourses() {
    this.courseService.getCourses(this.currentPage).subscribe({
      next: (res) => {
        if (res.data && res.data.Result) {
          this.courses = res.data.Result.map((c: any) => this.mapCourse(c));

          this.docCount = res.data.DocCount || this.courses.length;
          this.totalPages = res.data.pages || 1;
          this.currentPage = res.data.currentPage || this.currentPage;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          this.calculateStats();
        }
      },
      error: (err) => console.error('Error fetching courses', err)
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      if (this.selectedSubjectId) {
        this.onSubjectChange({ target: { value: this.selectedSubjectId } });
      } else {
        this.fetchCourses();
      }
    }
  }

  calculateStats() {
    this.totalPublished = this.courses.filter(c => c.status === 'Published').length;
    this.totalDraft = this.courses.filter(c => c.status === 'Draft').length;
  }

  mapCourse(c: any): Course {
    let displayStatus: Course['status'] = 'Draft';
    if (c.status === 'published') displayStatus = 'Published';
    else if (c.status === 'in_progress') displayStatus = 'In Progress';
    else if (c.status === 'archived') displayStatus = 'Archived';

    return {
      id: c._id,
      title: c.title,
      subject: c.subjectId?.name || 'General',
      teacherName: (c.teacherId?.firstName || '') + ' ' + (c.teacherId?.lastName || 'Unknown'),
      teacherImage: c.teacherId?.image || null,
      status: displayStatus,
      rawStatus: c.status,
      dateCreated: new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: 'auto_stories'
    };
  }

  toggleDropdown(id: string) {
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = id;
    }
  }

  closeDropdown() {
    this.activeDropdownId = null;
  }

  updateStatus(course: Course, action: 'publish' | 'unpublish' | 'archive' | 'unarchive' | 'start') {
    this.activeDropdownId = null; // Close dropdown

    let req;
    if (action === 'publish') req = this.courseService.publishCourse(course.id);
    else if (action === 'unpublish') req = this.courseService.unpublishCourse(course.id);
    else if (action === 'unarchive') req = this.courseService.publishCourse(course.id);
    else if (action === 'archive') req = this.courseService.archiveCourse(course.id);
    else if (action === 'start') req = this.courseService.startProgress(course.id);

    if (req) {
      req.subscribe({
        next: () => {
          this.fetchCourses();
        },
        error: (err) => console.error(`Error updating status to ${action}`, err)
      });
    }
  }

  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.fetchCourses();
        },
        error: (err) => console.error('Error deleting course', err)
      });
    }
  }
}
