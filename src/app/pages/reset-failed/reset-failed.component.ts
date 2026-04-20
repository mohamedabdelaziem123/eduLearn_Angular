import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-reset-failed',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './reset-failed.component.html'
})
export class ResetFailedComponent {
}
