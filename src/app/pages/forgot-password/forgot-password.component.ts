import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    forgotForm: FormGroup;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        const email = this.forgotForm.value.email;

        this.authService.sendForgotPassword({ email }).subscribe({
            next: () => {
                this.isLoading = false;
                // Securely store the email in local session state for the next step
                this.authService.setResetState(email, false);
                this.router.navigate(['/otp-verification']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Failed to send verification code. Please try again.';
            }
        });
    }
}
