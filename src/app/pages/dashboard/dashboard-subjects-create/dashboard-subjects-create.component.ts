import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { AdminService } from '../../../services/admin.service';
import { TeacherService } from '../../../services/teacher.service';

@Component({
    selector: 'app-dashboard-subjects-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, SideBarComponent],
    templateUrl: './dashboard-subjects-create.component.html'
})
export class DashboardSubjectsCreateComponent implements OnInit {
    subjectForm: FormGroup;
    isEditMode = false;
    subjectId: string | null = null;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private adminService: AdminService,
        private teacherService: TeacherService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.subjectForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            isPublished: [true]
        });
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.route.paramMap.subscribe(params => {
                this.subjectId = params.get('subjectId');
                if (this.subjectId) {
                    this.isEditMode = true;
                    this.loadSubjectData(this.subjectId);
                }
            });
        }
    }

    loadSubjectData(subjectId: string): void {
        this.teacherService.getSubjects().subscribe({
            next: (res: any) => {
                const subjectsArray = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
                if (subjectsArray.length >= 0) {
                    const subject = subjectsArray.find((s: any) => s._id === subjectId);
                    if (subject) {
                        this.subjectForm.patchValue({
                            name: subject.name,
                            description: subject.description || ''
                        });
                    }
                }
            },

            error: (err) => {
                console.error('Error loading subject:', err);
                this.errorMessage = 'Failed to load subject data';
            }
        });
    }

    onSubmit(): void {
        if (this.subjectForm.invalid) {
            Object.keys(this.subjectForm.controls).forEach(key => {
                this.subjectForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const formData = { ...this.subjectForm.value };
        delete formData.isPublished;

        if (this.isEditMode && this.subjectId) {

            this.adminService.updateSubject(this.subjectId, formData).subscribe({
                next: (res) => {
                    console.log('Subject updated successfully:', res);
                    this.router.navigate(['/dashboard/subjects']);
                },
                error: (err) => {
                    console.error('Error updating subject:', err);
                    this.errorMessage = err?.error?.message || 'Failed to update subject';
                    this.isSubmitting = false;
                },
                complete: () => {
                    this.isSubmitting = false;
                }
            });
        } else {
            this.adminService.createSubject(formData).subscribe({
                next: (res) => {
                    console.log('Subject created successfully:', res);
                    this.router.navigate(['/dashboard/subjects']);
                },
                error: (err) => {
                    console.error('Error creating subject:', err);
                    this.errorMessage = err?.error?.message || 'Failed to create subject';
                    this.isSubmitting = false;
                },
                complete: () => {
                    this.isSubmitting = false;
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/dashboard/subjects']);
    }

    getFieldError(fieldName: string): string {
        const field = this.subjectForm.get(fieldName);
        if (field?.hasError('required') && field.touched) {
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field?.hasError('minlength') && field.touched) {
            const minLength = field.errors?.['minlength'].requiredLength;
            return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
        }
        return '';
    }
}
