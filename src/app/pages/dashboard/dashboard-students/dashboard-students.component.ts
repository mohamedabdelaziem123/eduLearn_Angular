import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../enviroment/enviroment';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { DropdownMenuComponent } from '../../../components/ui/dropdown-menu/dropdown-menu.component';
import { LessonService } from '../../../services/lesson.service';

export interface Student {
  _id: string; // Real API likely uses MongoDB ObjectIds
  username: string;
  email: string;
  phone?: string;
  createdAt: string;
  isBlocked: boolean;
  profileImage?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBarComponent, SideBarComponent, DropdownMenuComponent],
  templateUrl: './dashboard-students.component.html',
})
export class DashboardStudentsComponent implements OnInit {
  students: Student[] = [];
  adminProfile: any = null;

  isLoading = false;

  // Real Dashboard Stats
  totalStudents = 0;

  // Pagination & Filters
  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
  totalDocs = 0;

  searchControl = new FormControl('');
  statusControl = new FormControl('');

  statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' }
  ];

  get startItem(): number {
    return this.totalDocs === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalDocs);
  }

  constructor(private adminService: AdminService , private lessonService: LessonService) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.document) {
      this.loadProfile();
      this.loadStudents();

      this.setupFilters();
      // this.testLessons();
    }
  }

  // testLessons(): void {
  //   this.lessonService.getLessonsByCourse("699ce70f704d53e6c7045c0f").subscribe({
  //     next: (res: any) => {
  //       console.log(res, 'lessons');
  //     },
  //     error: (err: any) => console.error('Error loading lessons:', err)
  //   });
  // }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadStudents();
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadStudents();
    });
  }

  loadProfile(): void {
    this.adminService.getUserProfile().subscribe({
      next: (res: any) => {
        this.adminProfile = res?.user || res?.data || res;
      },
      error: (err: any) => console.error('Error loading profile:', err)
    });
  }


  loadStudents(): void {
    this.isLoading = true;
    
    // Evaluate Optional Filters
    const searchValue = this.searchControl.value?.trim() || undefined;
    let isBlockedValue: boolean | undefined = undefined;
    
    if (this.statusControl.value === 'blocked') isBlockedValue = true;
    else if (this.statusControl.value === 'active') isBlockedValue = false;

    console.log('[DEBUG] statusControl value:', this.statusControl.value);
    console.log('[DEBUG] Computed isBlockedValue:', isBlockedValue);

    this.adminService.getAllStudents({ page: this.currentPage, size: this.pageSize, search: searchValue, isBlocked: isBlockedValue }).subscribe({
      next: (res: any) => {
        console.log(res, 'students');

        const data = res?.data || {};
        const studentList = Array.isArray(data) ? data : (data.Result || data.users || data.students || []);
        this.students = Array.isArray(studentList) ? studentList : [];

        this.totalDocs = Number(data.DocCount) || this.students.length;
        this.totalPages = Number(data.pages) || 1;
        this.currentPage = Number(data.currentPage) || this.currentPage;

        this.totalStudents = this.totalDocs;

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading students:', err);
        this.isLoading = false;
      }
    });
  }


  blockUser(userId: string): void {
    if (!confirm('Are you sure you want to block this user?')) return;
    this.adminService.blockStudent(userId).subscribe({
      next: () => {
        const student = this.students.find(s => s._id === userId);
        if (student) student.isBlocked = true;
      },
      error: (err: any) => alert('Failed to block user.')
    });
  }


  unblockUser(userId: string): void {
    if (!confirm('Are you sure you want to unblock this user?')) return;
    this.adminService.unblockStudent(userId).subscribe({
      next: () => {
        const student = this.students.find(s => s._id === userId);
        if (student) student.isBlocked = false;
      },
      error: (err: any) => alert('Failed to unblock user.')
    });
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadStudents();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStudents();
    }
  }

  getImageUrl(profileImage: string | undefined): string | null {
    if (!profileImage) return null;
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }
    
    // Otherwise, prepend CloudFront URL
    return `${environment.cdnUrl}/${profileImage}`;
  }
}
