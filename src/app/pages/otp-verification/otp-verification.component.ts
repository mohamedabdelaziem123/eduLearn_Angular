import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-otp-verification',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './otp-verification.component.html',
    styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
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
        const state = this.authService.getResetState();
        if (state && state.email) {
            this.email = state.email;
            console.log(this.email, 'retrieved email from robust sessionStorage');
        }
    }

    ngOnInit(): void {


        if (!this.email) {
            // If no email in state, fallback to login
            this.router.navigate(['/forgot-password']);
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
        console.log('onSubmit triggered. Form Value:', this.otpForm.value, 'Valid:', this.otpForm.valid);

        if (!this.isFormValid) {
            alert('Submit blocked! OTP form is incomplete: ' + JSON.stringify(this.otpForm.value));
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // Combine array into single string
        const otp = this.otpForm.value.join('');
        console.log('Submitting OTP:', otp, 'for email:', this.email);

        this.authService.verifyForgotPassword({ email: this.email, otp }).subscribe({
            next: (res) => {
                console.log('API Success:', res);
                this.isLoading = false;
                // Securely save that otp was verified
                this.authService.setResetState(this.email, true);

                this.router.navigate(['/reset-password']).then(success => {
                    if (!success) alert('Router failed to navigate to /reset-password');
                }).catch(err => alert('Router Error: ' + err));
            },
            error: (err) => {
                console.error('API Error:', err);
                this.isLoading = false;
                this.errorMessage = err?.error?.message || 'Invalid or expired OTP. Please try again.';
                alert('API Verification Failed: ' + this.errorMessage);
            }
        });
    }

    resendOtp(): void {
        if (this.isResending) return;

        this.isResending = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.resendForgotPassword({ email: this.email }).subscribe({
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

