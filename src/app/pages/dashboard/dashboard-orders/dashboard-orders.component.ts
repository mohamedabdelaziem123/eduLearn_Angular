import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { AdminService } from '../../../services/admin.service';
import { DashboardStatsResponse } from '../../../responses/admin/entities/admin.entity';

@Component({
  selector: 'app-dashboard-orders',
  standalone: true,
  imports: [CommonModule, NavBarComponent, SideBarComponent],
  templateUrl: './dashboard-orders.component.html'
})
export class DashboardOrdersComponent implements OnInit {
  stats: DashboardStatsResponse | null = null;
  orders: any[] = [];
  isLoading = true;
  studentProfiles: { [key: string]: any } = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Fetch stats
    this.adminService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = res?.data || res;
      },
      error: (err) => console.error('Error fetching dashboard stats', err)
    });

    // Fetch orders
    this.adminService.getAllOrders({ page: 1, size: 100 }).subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};
        const orderList = Array.isArray(data) ? data : (data.Result || data.orders || data.items || []);
        this.orders = Array.isArray(orderList) ? orderList : [];
        this.isLoading = false;

        // Hydrate student profiles
        this.orders.forEach(order => {
          const sid = this.getStudentId(order);
          if (sid && !this.studentProfiles[sid]) {
            this.studentProfiles[sid] = null; // mark as loading
            this.adminService.getUserDetails(sid).subscribe({
              next: (userRes: any) => {
                this.studentProfiles[sid] = userRes?.data || userRes;
              },
              error: () => {
                this.studentProfiles[sid] = { firstName: 'Unknown', lastName: '' };
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error fetching orders', err);
        this.isLoading = false;
      }
    });
  }

  getStudentId(order: any): string | null {
    if (!order.studentId) return null;
    if (typeof order.studentId === 'string') return order.studentId;
    return order.studentId._id || order.studentId.id || null;
  }

  getStudentName(order: any): string {
    // First check if studentId is a populated object
    if (order.studentId && typeof order.studentId === 'object') {
      const s = order.studentId;
      if (s.firstName || s.lastName) return `${s.firstName || ''} ${s.lastName || ''}`.trim();
      if (s.username) return s.username;
      if (s.name) return s.name;
    }
    // Fall back to hydrated profiles
    const sid = this.getStudentId(order);
    if (sid && this.studentProfiles[sid]) {
      const p = this.studentProfiles[sid];
      if (p.firstName || p.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
      if (p.username) return p.username;
    }
    return 'Loading...';
  }
}
