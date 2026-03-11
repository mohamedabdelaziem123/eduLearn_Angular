import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-side-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './side-bar.component.html'
})
export class SideBarComponent {
    // Pass the active route explicitly so the sidebar can highlight properly
    // E.g. 'dashboard', 'teachers', 'courses', 'students', 'subjects'
    @Input() activeRoute: string = '';
}
