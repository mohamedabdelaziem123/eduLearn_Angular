import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../enviroment/enviroment';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { CourseService } from '../../../services/course.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { DropdownMenuComponent } from '../../../components/ui/dropdown-menu/dropdown-menu.component';

export interface Course {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  teacherImage?: string;
  courseImage?: string;
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
  imports: [CommonModule, RouterModule, NavBarComponent, SideBarComponent, ClickOutsideDirective, DropdownMenuComponent],
  templateUrl: './dashboard-courses.component.html',
  styleUrl: './dashboard-courses.component.css'
})
export class DashboardCoursesComponent implements OnInit {
  courses: Course[] = [];
  subjects: any[] = [];
  subjectOptions: { value: string, label: string }[] = [{ value: '', label: 'All Subjects' }];
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
      next: (res: any) => {
        const subjectsArray = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
        if (subjectsArray.length >= 0) {
          this.subjects = subjectsArray;
          this.subjectOptions = [
            { value: '', label: 'All Subjects' },
            ...this.subjects.map(s => ({ 
              value: s._id, 
              label: s.name.charAt(0).toUpperCase() + s.name.slice(1) 
            }))
          ];
        }
      },

      error: (err: any) => console.error('Error fetching subjects', err)
    });
  }


  onSubjectChange(val: string) {
    this.selectedSubjectId = val;
    this.currentPage = 1;
    if (!this.selectedSubjectId) {
      this.fetchCourses();
      return;
    }

    this.courseService.getCoursesBySubject(this.selectedSubjectId, this.currentPage).subscribe({
      next: (res: any) => {
        const data = res.data || {};
        const courseList = Array.isArray(data) ? data : (data.courses || data.Result || data.data || []);
        if (data) {
          this.courses = courseList.map((c: any) => this.mapCourse(c));

          // Fallback if backend doesn't send proper pagination for subject filter yet
          this.docCount = data.DocCount || this.courses.length;
          this.totalPages = data.pages || 1;
          this.currentPage = data.currentPage || this.currentPage;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          this.calculateStats();
        }
      },

      error: (err: any) => console.error('Error fetching courses by subject', err)
    });

  }


  resetFilters() {
    this.selectedSubjectId = '';
    this.currentPage = 1;
    this.fetchCourses();
  }

  fetchCourses() {
    this.courseService.getCourses(this.currentPage).subscribe({
      next: (res: any) => {
        if (res.data && res.data.Result) {
          this.courses = res.data.Result.map((c: any) => this.mapCourse(c));

          this.docCount = res.data.DocCount || this.courses.length;
          this.totalPages = res.data.pages || 1;
          this.currentPage = res.data.currentPage || this.currentPage;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          this.calculateStats();
        }
      },
      error: (err: any) => console.error('Error fetching courses', err)
    });
  }


  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      if (this.selectedSubjectId) {
        this.onSubjectChange(this.selectedSubjectId);
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
      teacherImage: c.teacherId?.profileImage || null,
      courseImage: c.image || null,
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
        error: (err: any) => console.error(`Error updating status to ${action}`, err)
      });
    }

  }

  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.fetchCourses();
        },
        error: (err: any) => console.error('Error deleting course', err)
      });

    }
  }

  getImageUrl(image: string | undefined | null): string | null {
    if (!image) return null;
    
    // If it's already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    return `${environment.cdnUrl}/${image}`;
  }
}
