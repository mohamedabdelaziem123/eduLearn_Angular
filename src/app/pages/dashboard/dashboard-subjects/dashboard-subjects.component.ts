import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { TeacherService, Subject } from '../../../services/teacher.service';
import { AdminService } from '../../../services/admin.service';

@Component({
    selector: 'app-dashboard-subjects',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, SideBarComponent],
    templateUrl: './dashboard-subjects.component.html'
})
export class DashboardSubjectsComponent implements OnInit {
    subjects: Subject[] = [];
    filteredSubjects: Subject[] = [];
    isLoading = false;
    searchControl = new FormControl('');

    // Pagination
    currentPage = 1;
    itemsPerPage = 4;

    constructor(
        private teacherService: TeacherService,
        private adminService: AdminService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.fetchSubjects();
            
            this.searchControl.valueChanges.subscribe(value => {
                this.filterSubjects(value || '');
            });
        }
    }

    fetchSubjects(): void {
        this.isLoading = true;
        this.teacherService.getSubjects().subscribe({
            next: (res: any) => {
                const subjectsArray = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
                if (subjectsArray.length >= 0) {
                    this.subjects = subjectsArray;
                    this.filteredSubjects = [...this.subjects];
                }
            },
            error: (err: any) => {
                console.error('Error fetching subjects', err);
                this.subjects = [];
                this.filteredSubjects = [];
            },

            complete: () => {
                this.isLoading = false;
            }

        });
    }

    filterSubjects(searchTerm: string): void {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredSubjects = [...this.subjects];
        } else {
            this.filteredSubjects = this.subjects.filter(subject => 
                subject.name.toLowerCase().includes(term) || 
                (subject.description && subject.description.toLowerCase().includes(term))
            );
        }
        this.currentPage = 1;
    }

    editSubject(subjectId: string): void {
        this.router.navigate(['/dashboard/subjects/edit', subjectId]);
    }

    deleteSubject(subjectId: string): void {
        if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
            return;
        }

        this.adminService.deleteSubject(subjectId).subscribe({
            next: (res) => {
                console.log('Subject deleted successfully:', res);
                this.subjects = this.subjects.filter(s => s._id !== subjectId);
                this.filterSubjects(this.searchControl.value || '');
                
                if (this.paginatedSubjects.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                }
            },
            error: (err) => {
                console.error('Error deleting subject:', err);
                alert('Failed to delete subject. Please try again.');
            }
        });
    }

    getCourseCount(subject: Subject): number {
        return subject.courses?.length || 0;
    }

    // Pagination methods
    get paginatedSubjects(): Subject[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredSubjects.slice(startIndex, endIndex);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredSubjects.length / this.itemsPerPage);
    }

    get startItem(): number {
        return this.filteredSubjects.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    get endItem(): number {
        if (this.filteredSubjects.length === 0) return 0;
        const end = this.currentPage * this.itemsPerPage;
        return end > this.filteredSubjects.length ? this.filteredSubjects.length : end;
    }

    get totalDocs(): number {
        return this.filteredSubjects.length;
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

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}
