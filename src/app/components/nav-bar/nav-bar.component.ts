import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
    @Input() showFilter: boolean = true;
    @Input() showBell: boolean = true;

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
