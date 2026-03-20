import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
    @Input() showFilter: boolean = true;
    @Input() showBell: boolean = true;
    @Input() isTeacherNav: boolean = false;
    @Input() activeRoute: string = '';

    adminProfile: any = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        if (typeof window !== 'undefined' && window.document) {
            this.adminService.getUserProfile().subscribe({
                next: (res: any) => {
                    this.adminProfile = res?.user || res?.data || res;
                },
                error: (err: any) => console.error('Error loading profile:', err)
            });
        }
    }
}
