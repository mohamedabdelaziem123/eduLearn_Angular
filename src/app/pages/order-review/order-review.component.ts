import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { AdminService } from '../../services/admin.service';
import { OrderService } from '../../services/order.service';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/course.service';
import { environment } from '../../enviroment/enviroment';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './order-review.component.html'
})
export class OrderReviewComponent implements OnInit {
  orderId: string | null = null;
  order: any = null;
  isLoading = true;
  isCheckingOut = false;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private orderService: OrderService,
    private lessonService: LessonService,
    private courseService: CourseService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // skip on server
    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('orderId');
      if (this.orderId) {
        this.loadOrder(this.orderId);
      }
    });
  }

  loadOrder(id: string): void {
    this.isLoading = true;

    // Try to read pre-fetched cart items from router navigation state
    const stateItems: any[] = (this.isBrowser && window.history.state?.preFetchedItems) || [];

    this.adminService.getOrderById(id).subscribe({
      next: (res: any) => {
        const order = res?.data || res;

        // DB column is "lessons" (JSONB), not "items"
        const orderLessons: any[] = order?.lessons || order?.items || [];

        // Recalculate totalAmount numerically (PG decimal → string)
        order.totalAmount = orderLessons.reduce(
          (sum: number, item: any) => sum + Number(item.price || 0), 0
        );

        // Because the backend stores courseTitle as 'Unknown Course',
        // we ALWAYS need to hydrate course details from APIs.
        // If stateItems exist (from cart), try the fast path first.
        if (stateItems.length > 0) {
          order.lessons = orderLessons.map((item: any) => {
            const matched = stateItems.find(
              (s: any) => (s._id || s.id) === item.lessonId
            );
            if (matched) {
              return {
                ...item,
                courseTitle: matched.courseTitle || item.courseTitle,
                courseImage: matched.courseImage || null
              };
            }
            return item;
          });
          this.order = order;
          this.isLoading = false;
          return;
        }

        // Slow path: fetch lesson details to get courseId, then course details
        if (orderLessons.length === 0) {
          order.lessons = orderLessons;
          this.order = order;
          this.isLoading = false;
          return;
        }

        this.hydrateFromAPIs(order, orderLessons);
      },
      error: (err: any) => {
        console.error('Error loading order:', err);
        this.isLoading = false;
      }
    });
  }

  private hydrateFromAPIs(order: any, orderLessons: any[]): void {
    // Step 1: Fetch each lesson by ID to get its courseId
    const lessonReqs = orderLessons.map((item: any) =>
      this.lessonService.getLessonById(item.lessonId).pipe(
        map((lRes: any) => {
          let lesson = lRes?.data || lRes;
          if (Array.isArray(lesson)) lesson = lesson[0];
          return { orderItem: item, lesson };
        }),
        catchError(() => of({ orderItem: item, lesson: null }))
      )
    );

    forkJoin(lessonReqs).subscribe({
      next: (results: any[]) => {
        // Step 2: Collect unique courseIds
        const courseIdSet = new Set<string>();
        for (const r of results) {
          if (r.lesson?.courseId) {
            const cid = typeof r.lesson.courseId === 'object'
              ? (r.lesson.courseId._id || r.lesson.courseId.id)
              : r.lesson.courseId;
            if (cid) courseIdSet.add(cid);
          }
        }

        if (courseIdSet.size === 0) {
          // Could not get any courseIds — just use what we have
          order.lessons = orderLessons;
          this.order = order;
          this.isLoading = false;
          return;
        }

        // Step 3: Fetch each unique course
        const courseReqs = Array.from(courseIdSet).map((cid: string) =>
          this.courseService.getCourseById(cid).pipe(
            map((cRes: any) => {
              let course = cRes?.data || cRes;
              if (Array.isArray(course)) course = course[0];
              return course;
            }),
            catchError(() => of(null))
          )
        );

        forkJoin(courseReqs).subscribe({
          next: (courses: any[]) => {
            // Build courseId→course lookup
            const courseMap: Record<string, any> = {};
            for (const c of courses) {
              if (c) {
                const key = c._id || c.id;
                if (key) courseMap[key] = c;
              }
            }

            // Step 4: Merge course data onto order lessons
            order.lessons = results.map((r: any) => {
              const lesson = r.lesson;
              const item = r.orderItem;
              if (!lesson) return item;

              const cid = typeof lesson.courseId === 'object'
                ? (lesson.courseId._id || lesson.courseId.id)
                : lesson.courseId;
              const courseObj = courseMap[cid];

              return {
                ...item,
                courseTitle: courseObj?.title || item.courseTitle || 'Unknown Course',
                courseImage: courseObj?.image || courseObj?.coverImage || null
              };
            });

            this.order = order;
            this.isLoading = false;
          },
          error: () => {
            order.lessons = orderLessons;
            this.order = order;
            this.isLoading = false;
          }
        });
      },
      error: () => {
        order.lessons = orderLessons;
        this.order = order;
        this.isLoading = false;
      }
    });
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  getStatusLabel(): string {
    return (this.order?.status || 'pending').toUpperCase();
  }

  getStatusColor(): string {
    const s = (this.order?.status || '').toLowerCase();
    if (s === 'paid' || s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  isPending(): boolean {
    return (this.order?.status || '').toLowerCase() === 'pending';
  }

  checkout(): void {
    if (!this.orderId || this.isCheckingOut) return;
    this.isCheckingOut = true;

    this.orderService.checkOut(this.orderId).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const url = data?.sessionURL || data?.url;
        this.isCheckingOut = false;
        if (url) {
          window.location.href = url;
        } else {
          alert('Payment link could not be generated.');
        }
      },
      error: (err: any) => {
        console.error('Error checking out:', err);
        this.isCheckingOut = false;
        alert('Checkout failed. Please try again.');
      }
    });
  }
}
