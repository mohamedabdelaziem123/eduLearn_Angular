import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../enviroment/enviroment';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CourseService } from '../../services/course.service';
import { TeacherService, Teacher } from '../../services/teacher.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { LessonService } from '../../services/lesson.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-discovery',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './discovery.component.html',
  styleUrls: []
})
export class DiscoveryComponent implements OnInit {
  courses: any[] = [];
  subjects: any[] = [];
  teachers: Teacher[] = [];
  
  selectedSubjectId: string = '';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pagesArray: number[] = [];
  totalCourses: number = 0;
  isLoading: boolean = false;

  // Cart State
  cartLessons: any[] = [];
  isCartLoading: boolean = false;
  isCreatingOrder: boolean = false;

  constructor(
    private courseService: CourseService,
    private teacherService: TeacherService,
    private cartService: CartService,
    private orderService: OrderService,
    private lessonService: LessonService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchSubjects();
      this.fetchTeachers();
      this.fetchCourses();
      this.loadCart();
    }
  }

  loadCart(): void {
    this.isCartLoading = true;
    this.cartService.getCart().pipe(
      switchMap((res: any) => {
        let cart = res?.data || res;
        let lessonIds: any[] = cart?.lessonIds || cart?.lessons || [];
        if (!lessonIds || lessonIds.length === 0) return of([]);

        if (typeof lessonIds === 'string') {
            try { lessonIds = JSON.parse(lessonIds); } catch (e) { lessonIds = []; }
        }

        const lessonRequests = lessonIds.map(item => {
            const rawId = typeof item === 'object' ? (item._id || item.id || item.lessonId) : item;
            if (typeof item === 'object' && (item.title || item.lessonTitle) && item.price !== undefined) {
                return of(item);
            }
            return this.lessonService.getLessonById(rawId).pipe(
              map((lRes: any) => {
                  let extracted = lRes?.data || lRes?.lesson || lRes;
                  if (Array.isArray(extracted)) extracted = extracted[0];
                  return extracted;
              }),
              catchError(() => of(null))
            );
        });

        return forkJoin(lessonRequests).pipe(
          switchMap(lessons => {
            const validLessons = lessons.flat().filter(l => l !== null && typeof l === 'object');
            const uniqueCourseIds = [...new Set(validLessons.map((l: any) => {
                 return typeof l.courseId === 'object' ? (l.courseId._id || l.courseId.id) : l.courseId;
            }))].filter(id => id);
            
            if (uniqueCourseIds.length === 0) return of(validLessons);

            const courseRequests = uniqueCourseIds.map((cid: any) => 
               this.courseService.getCourseById(cid).pipe(
                 map((cRes: any) => {
                     let extracted = cRes?.data || cRes?.course || cRes;
                     if (Array.isArray(extracted)) extracted = extracted[0];
                     return extracted;
                 }),
                 catchError(() => of(null))
               )
            );

            return forkJoin(courseRequests).pipe(
              map(courses => {
                const courseMap = courses.reduce((acc, course) => {
                  if (course && (course._id || course.id)) {
                      acc[course._id || course.id] = course;
                  }
                  return acc;
                }, {} as any);

                return validLessons.map((lesson: any) => {
                   const cid = typeof lesson.courseId === 'object' ? (lesson.courseId._id || lesson.courseId.id) : lesson.courseId;
                   const courseObj = courseMap[cid] || (typeof lesson.courseId === 'object' ? lesson.courseId : null);
                   return {
                      ...lesson,
                      title: lesson.title || lesson.lessonTitle || 'Untitled Lesson',
                      courseTitle: courseObj?.title || 'Unknown Course',
                      courseImage: courseObj?.image || courseObj?.coverImage || null,
                      price: lesson.price ?? 0
                   };
                });
              })
            );
          })
        );
      })
    ).subscribe({
      next: (hydratedLessons) => {
        this.cartLessons = hydratedLessons;
        this.isCartLoading = false;
      },
      error: (err) => {
        console.error('Error loading cart details:', err);
        this.isCartLoading = false;
        this.cartLessons = [];
      }
    });
  }

  getCartTotal(): number {
    return this.cartLessons.reduce((sum, l) => sum + Number(l.price || 0), 0);
  }

  proceedToCheckout(): void {
    if (this.isCreatingOrder || this.cartLessons.length === 0) return;
    this.isCreatingOrder = true;

    this.orderService.createOrder().subscribe({
      next: (res: any) => {
        const order = res?.data || res;
        const orderId = order?.orderId || order?._id || order?.id;
        this.isCreatingOrder = false;
        this.router.navigate(['/order-review', orderId], {
          state: { preFetchedItems: this.cartLessons }
        });
      },
      error: (err) => {
        console.error('Error creating order:', err);
        this.isCreatingOrder = false;
        alert('Failed to create order.');
      }
    });
  }

  fetchSubjects() {
    this.courseService.getSubjects().subscribe({
      next: (res: any) => {
        this.subjects = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
      },
      error: (err: any) => console.error('Error fetching subjects', err)
    });
  }

  fetchTeachers() {
    this.teacherService.getAllTeachers().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.teachers = Array.isArray(data) ? data : (data.teachers || data.Result || []);
        // Just take top 5 for sidebar
        this.teachers = this.teachers.slice(0, 5);
      },
      error: (err: any) => console.error('Error fetching teachers', err)
    });
  }

  fetchCourses() {
    this.isLoading = true;
    const request = this.selectedSubjectId 
      ? this.courseService.getCoursesBySubject(this.selectedSubjectId, this.currentPage, 6)
      : this.courseService.getCourses(this.currentPage, 6);

    request.subscribe({
      next: (res: any) => {
        console.log('[Discovery] Raw API response:', res);
        
        const data = res?.data || res || {};
        
        // Handle multiple possible response shapes
        let courseList: any[] = [];
        if (Array.isArray(data)) {
          courseList = data;
        } else if (data.Result) {
          courseList = data.Result;
        } else if (data.courses) {
          courseList = data.courses;
        } else if (data.data) {
          courseList = Array.isArray(data.data) ? data.data : [];
        }
        
        this.courses = courseList;
        console.log('[Discovery] Parsed courses:', this.courses);
        
        this.totalCourses = data.DocCount || this.courses.length;
        this.totalPages = data.pages || 1;
        this.currentPage = data.currentPage || this.currentPage;
        this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('[Discovery] Error fetching courses:', err);
        this.isLoading = false;
      }
    });
  }

  selectSubject(id: string) {
    this.selectedSubjectId = id;
    this.currentPage = 1;
    this.fetchCourses();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchCourses();
    }
  }

  getImageUrl(image: string | undefined | null): string | null {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }
}
