import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-reset-success',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './reset-success.component.html',
    styleUrls: ['./reset-success.component.css']
})
export class ResetSuccessComponent { }
