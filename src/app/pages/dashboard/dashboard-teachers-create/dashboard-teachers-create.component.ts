import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { AdminService } from '../../../services/admin.service';

@Component({
    selector: 'app-dashboard-teachers-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, SideBarComponent],
    templateUrl: './dashboard-teachers-create.component.html'
})
export class DashboardTeachersCreateComponent {
    teacherForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private adminService: AdminService
    ) {
        this.teacherForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            degree: ['', Validators.required]
        });
    }

    get f() { return this.teacherForm.controls; }

    onSubmit(): void {
        if (this.teacherForm.invalid) {
            this.teacherForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.adminService.createTeacher(this.teacherForm.value).subscribe({
            next: (res) => {
                console.log('Teacher created successfully:', res);
                this.isSubmitting = false;
                this.router.navigate(['/dashboard/teachers']);
            },
            error: (err) => {
                console.error('Error creating teacher:', err);
                this.errorMessage = err?.error?.message || err?.message || 'Failed to create teacher. Please try again.';
                this.isSubmitting = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/dashboard/teachers']);
    }
}
