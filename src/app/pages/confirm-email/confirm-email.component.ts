import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-confirm-email',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './confirm-email.component.html'
})
export class ConfirmEmailComponent implements OnInit {
    @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
    otpForm: FormArray;

    email: string = '';
    isLoading = false;
    isResending = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        // Array of 6 form controls
        this.otpForm = this.fb.array([
            new FormControl('', Validators.required),
            new FormControl('', Validators.required),
            new FormControl('', Validators.required),
            new FormControl('', Validators.required),
            new FormControl('', Validators.required),
            new FormControl('', Validators.required),
        ]);

        // Attempt to grab email from session state
        const savedEmail = this.authService.getConfirmEmailState();
        if (savedEmail) {
            this.email = savedEmail;
        }
    }

    ngOnInit(): void {
        if (!this.email) {
            // If no email in state, fallback to login/signup
            this.router.navigate(['/signup']);
        }
    }

    getControl(index: number): FormControl {
        return this.otpForm.controls[index] as FormControl;
    }

    // Handle backspace navigation
    onKeyDown(event: KeyboardEvent, index: number): void {
        const inputElements = this.otpInputs.toArray();
        const inputElement = inputElements[index].nativeElement as HTMLInputElement;

        if (event.key === 'Backspace') {
            if (index > 0 && !inputElement.value) {
                inputElements[index - 1].nativeElement.focus();
            }
        }
    }

    // Handle auto-advancing to the next input when a value is typed
    onInput(event: Event, index: number): void {
        const inputElements = this.otpInputs.toArray();
        const inputElement = inputElements[index].nativeElement as HTMLInputElement;

        if (inputElement.value && /^[0-9]$/.test(inputElement.value)) {
            if (index < 5) {
                inputElements[index + 1].nativeElement.focus();
            }
        } else if (inputElement.value) {
            // clear invalid input
            inputElement.value = '';
            this.getControl(index).setValue('');
        }
    }

    get isFormValid(): boolean {
        return this.otpForm.valid;
    }

    onSubmit(): void {
        if (!this.isFormValid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Combine array into single string
        const otp = this.otpForm.value.join('');

        this.authService.confirmEmail({ email: this.email, code: otp }).subscribe({
            next: (res) => {
                this.isLoading = false;
                // successful! 
                this.authService.clearConfirmEmailState();
                this.router.navigate(['/confirm-success']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Invalid or expired OTP. Please try again.';
                // On complete failure, perhaps redirect to confirm-failed
                // we'll keep error inline unless requested to route. Based on task text:
                // "On success -> routes to /confirm-success. On fail -> route to confirm-failed"
                // The task description says "confirm-failed Navigation page shown if email confirmation fails."
                // Since they specifically wanted a failure component, let's route to it.
                this.router.navigate(['/confirm-failed']);
            }
        });
    }

    resendOtp(): void {
        if (this.isResending) return;

        this.isResending = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.resendConfirmEmail({ email: this.email }).subscribe({
            next: () => {
                this.isResending = false;
                this.successMessage = 'A new verification code has been sent.';
                // Clear current form
                this.otpForm.reset();
                this.otpInputs.first.nativeElement.focus();
            },
            error: (err) => {
                this.isResending = false;
                this.errorMessage = err?.error?.message || 'Failed to resend OTP.';
            }
        });
    }
}
