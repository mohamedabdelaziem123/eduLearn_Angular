import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';

@Component({
    selector: 'app-dashboard-teachers',
    standalone: true,
    imports: [CommonModule, RouterModule, NavBarComponent, SideBarComponent],
    templateUrl: './dashboard-teachers.component.html'
})
export class DashboardTeachersComponent {
    teachers = [
        { id: '#T1023', name: 'Sarah Jenkins', subject: 'Mathematics', email: 'sarah.j@school.edu', avatar: 'https://i.pravatar.cc/150?img=5', dotColor: 'bg-blue-400' },
        { id: '#T1045', name: 'Michael Chen', subject: 'Chemistry', email: 'm.chen@school.edu', avatar: 'https://i.pravatar.cc/150?img=11', dotColor: 'bg-orange-400' },
        { id: '#T1122', name: 'Elena Rodriguez', subject: 'Biology', email: 'e.rodriguez@school.edu', avatar: 'https://i.pravatar.cc/150?img=9', dotColor: 'bg-green-500' },
        { id: '#T1098', name: 'David Smith', subject: 'History', email: 'd.smith@school.edu', avatar: 'https://i.pravatar.cc/150?img=12', dotColor: 'bg-indigo-500' },
    ];
}
