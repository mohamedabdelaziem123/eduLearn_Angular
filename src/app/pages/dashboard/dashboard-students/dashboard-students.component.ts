import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';

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
  imports: [CommonModule, NavBarComponent, SideBarComponent],
  templateUrl: './dashboard-students.component.html',
})
export class DashboardStudentsComponent implements OnInit {
  students: Student[] = [];
  adminProfile: any = null;

  isLoading = false;

  // Real Dashboard Stats
  totalStudents = 0;
  activeNow = 0;
  newSignups = 0;

  // Pagination & Filters
  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
  totalDocs = 0;

  get startItem(): number {
    return this.totalDocs === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalDocs);
  }

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.document) {
      this.loadProfile();
      this.loadStudents();
    }
  }

  loadProfile(): void {
    this.adminService.getUserProfile().subscribe({
      next: (res) => {
        this.adminProfile = res?.user || res?.data || res;
      },
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  loadStudents(): void {
    this.isLoading = true;
    this.adminService.getStudents(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        console.log(res, 'students');

        const data = res?.data || {};
        const studentList = data.Result || data || [];
        this.students = studentList;

        this.totalDocs = Number(data.DocCount) || this.students.length;
        this.totalPages = Number(data.pages) || 1;
        this.currentPage = Number(data.currentPage) || this.currentPage;

        this.totalStudents = this.totalDocs;
        this.activeNow = this.students.filter(s => !s.isBlocked).length;

        // Calculate new signups in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.newSignups = this.students.filter(s => {
          if (!s.createdAt) return false;
          return new Date(s.createdAt) >= twentyFourHoursAgo;
        }).length;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.isLoading = false;
      }
    });
  }

  blockUser(userId: string): void {
    if (!confirm('Are you sure you want to block this user?')) return;
    this.adminService.blockUser(userId).subscribe({
      next: () => {
        const student = this.students.find(s => s._id === userId);
        if (student) student.isBlocked = true;
        this.activeNow = this.students.filter(s => !s.isBlocked).length;
      },
      error: (err) => alert('Failed to block user.')
    });
  }

  unblockUser(userId: string): void {
    if (!confirm('Are you sure you want to unblock this user?')) return;
    this.adminService.unblockUser(userId).subscribe({
      next: () => {
        const student = this.students.find(s => s._id === userId);
        if (student) student.isBlocked = false;
        this.activeNow = this.students.filter(s => !s.isBlocked).length;
      },
      error: (err) => alert('Failed to unblock user.')
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
}
