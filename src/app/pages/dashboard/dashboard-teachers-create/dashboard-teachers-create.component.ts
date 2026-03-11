import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';

@Component({
    selector: 'app-dashboard-teachers-create',
    standalone: true,
    imports: [CommonModule, RouterModule, NavBarComponent, SideBarComponent],
    templateUrl: './dashboard-teachers-create.component.html'
})
export class DashboardTeachersCreateComponent {
}
