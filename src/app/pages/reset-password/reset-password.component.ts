import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    email: string = '';
    isVerified: boolean = false;

    isLoading = false;
    errorMessage = '';
    showPassword = false;
    showConfirm = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, this.strongPasswordValidator]],
            confirmpassword: ['', [Validators.required]]
        }, { validators: this.passwordsMatchValidator });

        // Read state safely from storage
        const state = this.authService.getResetState();

        if (state && state.email) {
            this.email = state.email;
            this.isVerified = state.verified;
        }
    }

    ngOnInit(): void {
        if (!this.email || !this.isVerified) {
            this.router.navigate(['/forgot-password']);
        }
    }

    // --- Password Strength Validators ---
    strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) return null;

        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
        const minLength = value.length >= 8;

        const errors: any = {};
        if (!hasUpperCase) errors['uppercase'] = true;
        if (!hasNumber) errors['number'] = true;
        if (!hasSpecial) errors['special'] = true;
        if (!minLength) errors['minlength'] = true;

        return Object.keys(errors).length ? errors : null;
    }

    // --- Check if passwords match ---
    passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
        const p = group.get('password')?.value;
        const cp = group.get('confirmpassword')?.value;
        return p === cp ? null : { mismatch: true };
    }

    // Helper getters for template UI checklist
    get reqLength() { return this.resetForm.get('password')?.value?.length >= 8; }
    get reqUpper() { return /[A-Z]/.test(this.resetForm.get('password')?.value || ''); }
    get reqNumber() { return /[0-9]/.test(this.resetForm.get('password')?.value || ''); }
    get reqSpecial() { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.resetForm.get('password')?.value || ''); }

    onSubmit(): void {
        if (this.resetForm.invalid) {
            this.resetForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        // The actual email comes from state variable, not the disabled input
        const payload = {
            email: this.email,
            password: this.resetForm.value.password,
            confirmpassword: this.resetForm.value.confirmpassword
        };

        this.authService.resetForgotPassword(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.authService.clearResetState();
                this.router.navigate(['/reset-success']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Failed to securely update password. Please try again later.';
            }
        });
    }

    togglePasswordVisibility(field: 'password' | 'confirmpassword'): void {
        if (field === 'password') this.showPassword = !this.showPassword;
        if (field === 'confirmpassword') this.showConfirm = !this.showConfirm;
    }
}

