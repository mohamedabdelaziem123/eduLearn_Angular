import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-confirm-success',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './confirm-success.component.html'
})
export class ConfirmSuccessComponent {
}
