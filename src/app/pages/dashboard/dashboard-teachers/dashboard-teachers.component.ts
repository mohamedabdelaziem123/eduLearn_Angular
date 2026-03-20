import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { DropdownMenuComponent } from '../../../components/ui/dropdown-menu/dropdown-menu.component';
import { TeacherService, Teacher, Subject } from '../../../services/teacher.service';
import { AdminService } from '../../../services/admin.service';
import { environment } from '../../../enviroment/enviroment';

@Component({
    selector: 'app-dashboard-teachers',
    standalone: true,
    imports: [CommonModule, RouterModule, NavBarComponent, SideBarComponent, DropdownMenuComponent],
    templateUrl: './dashboard-teachers.component.html'
})
export class DashboardTeachersComponent implements OnInit {
    teachers: Teacher[] = [];
    subjects: Subject[] = [];
    subjectOptions: { value: string, label: string }[] = [
        { value: '', label: 'All Subjects' }
    ];
    selectedSubject = '';
    isLoadingTeachers = false;
    isLoadingSubjects = false;

    // Pagination
    currentPage = 1;
    itemsPerPage = 4;

    constructor(
        private teacherService: TeacherService,
        private adminService: AdminService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.fetchSubjects();
            this.fetchTeachers();
        }
    }

    fetchSubjects(): void {
        this.isLoadingSubjects = true;
        this.teacherService.getSubjects().subscribe({
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
            error: (err) => console.error('Error fetching subjects', err),

            complete: () => {
                this.isLoadingSubjects = false;
            }
        });
    }

    fetchTeachers(): void {
        this.isLoadingTeachers = true;
        this.teacherService.getAllTeachers().subscribe({

            next: (res) => {
                if (res.data) {
                    // Handle both response formats
                    if (Array.isArray(res.data)) {
                        this.teachers = res.data;
                    } else if ('teachers' in res.data) {
                        this.teachers = res.data.teachers;
                    }
                }
            },
            error: (err) => {
                console.error('Error fetching teachers', err);
                this.teachers = [];
            },
            complete: () => {
                this.isLoadingTeachers = false;
            }
        });
    }

    fetchTeachersBySubject(subjectId: string): void {
        this.isLoadingTeachers = true;
        this.teacherService.getTeachersBySubject(subjectId).subscribe({
            next: (res) => {
                if (res.data) {
                    // Handle both response formats
                    if (Array.isArray(res.data)) {
                        this.teachers = res.data;
                    } else if ('teachers' in res.data) {
                        this.teachers = res.data.teachers;
                    }
                }
            },
            error: (err) => {
                console.error('Error fetching teachers by subject', err);
                this.teachers = [];
            },
            complete: () => {
                this.isLoadingTeachers = false;
            }
        });
    }

    onSubjectChange(subjectId: string): void {
        this.selectedSubject = subjectId;
        this.currentPage = 1; // Reset to first page when filter changes
        if (subjectId) {
            this.fetchTeachersBySubject(subjectId);
        } else {
            this.fetchTeachers();
        }
    }

    resetFilters(): void {
        this.selectedSubject = '';
        this.currentPage = 1; // Reset to first page
        this.fetchTeachers();
    }

    getTeacherName(teacher: Teacher): string {
        if (teacher.firstName && teacher.lastName) {
            return `${teacher.firstName} ${teacher.lastName}`;
        }
        return teacher.username;
    }

    getTeacherId(teacher: Teacher): string {
        return `#T${teacher._id.slice(-4)}`;
    }

    // Pagination methods
    get paginatedTeachers(): Teacher[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.teachers.slice(startIndex, endIndex);
    }

    get totalPages(): number {
        return Math.ceil(this.teachers.length / this.itemsPerPage);
    }

    get startIndex(): number {
        return this.teachers.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    get endIndex(): number {
        if (this.teachers.length === 0) return 0;
        const end = this.currentPage * this.itemsPerPage;
        return end > this.teachers.length ? this.teachers.length : end;
    }

    get pageNumbers(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
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

    deleteTeacher(teacherId: string): void {
        if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
            return;
        }

        this.adminService.deleteTeacher(teacherId).subscribe({
            next: (res) => {
                console.log('Teacher deleted successfully:', res);
                // Remove teacher from local array
                this.teachers = this.teachers.filter(t => t._id !== teacherId);
                
                // Adjust current page if needed
                if (this.paginatedTeachers.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                }
            },
            error: (err) => {
                console.error('Error deleting teacher:', err);
                alert('Failed to delete teacher. Please try again.');
            }
        });
    }
}
