import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/course.service';
import { environment } from '../../enviroment/enviroment';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cart: any = null;
  lessons: any[] = [];
  isLoading = true;
  isCreatingOrder = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private lessonService: LessonService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().pipe(
      switchMap((res: any) => {
        this.cart = res?.data || res;
        let lessonIds: any[] = this.cart?.lessonIds || this.cart?.lessons || [];
        
        if (!lessonIds || lessonIds.length === 0) {
          return of([]); // Return empty array if cart is empty
        }

        // Fix potential stringified arrays or arrays of arrays
        if (typeof lessonIds === 'string') {
            try { lessonIds = JSON.parse(lessonIds); } catch (e) { lessonIds = []; }
        }

        // Fetch all individual lessons using their IDs (or use them directly if fully populated)
        const lessonRequests = lessonIds.map(item => {
            const rawId = typeof item === 'object' ? (item._id || item.id || item.lessonId) : item;
            
            // If it's already a full object with title and price, wrap it in 'of' to skip fetching
            if (typeof item === 'object' && (item.title || item.lessonTitle) && item.price !== undefined) {
                return of(item);
            }

            return this.lessonService.getLessonById(rawId).pipe(
              map((lRes: any) => {
                  let extracted = lRes?.data || lRes?.lesson || lRes;
                  // If backend returns an array for a single item, take the first item
                  if (Array.isArray(extracted)) {
                      extracted = extracted[0];
                  }
                  return extracted;
              }),
              catchError((err) => {
                  console.error('Failed to get lesson', rawId, err);
                  return of(null);
              })
            );
        });

        return forkJoin(lessonRequests).pipe(
          switchMap(lessons => {
            // Flatten in case of nested arrays and remove nulls
            const validLessons = lessons.flat().filter(l => l !== null && typeof l === 'object');
            
            // Extract unique Course IDs to fetch course images and titles
            const uniqueCourseIds = [...new Set(validLessons.map((l: any) => {
                 // In case courseId is a populated object instead of a string
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

                // Map course details onto the lesson object for easy UI binding
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
        this.lessons = hydratedLessons;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cart details:', err);
        this.isLoading = false;
        this.lessons = [];
      }
    });
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  getLessonId(lesson: any): string {
    return lesson._id || lesson.id;
  }

  getCourseTitle(lesson: any): string {
    return lesson.courseTitle || lesson.courseId?.title || 'Course';
  }

  getCourseImage(lesson: any): string {
    const img = lesson.courseImage || lesson.courseId?.image || lesson.courseId?.coverImage || '';
    return this.getImageUrl(img);
  }

  getTotalPrice(): number {
    return this.lessons.reduce((sum: number, l: any) => sum + Number(l.price || 0), 0);
  }

  removeItem(lesson: any): void {
    const id = this.getLessonId(lesson);
    this.cartService.removeFromCart({ lessonId: id }).subscribe({
      next: () => {
        this.lessons = this.lessons.filter((l: any) => this.getLessonId(l) !== id);
      },
      error: (err) => console.error('Error removing item:', err)
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.lessons = [];
      },
      error: (err) => console.error('Error clearing cart:', err)
    });
  }

  proceedToCheckout(): void {
    if (this.isCreatingOrder || this.lessons.length === 0) return;
    this.isCreatingOrder = true;

    this.orderService.createOrder().subscribe({
      next: (res: any) => {
        const order = res?.data || res;
        const orderId = order?.orderId || order?._id || order?.id;
        this.isCreatingOrder = false;
        this.router.navigate(['/order-review', orderId], {
          state: { preFetchedItems: this.lessons }
        });
      },
      error: (err) => {
        console.error('Error creating order:', err);
        this.isCreatingOrder = false;
        alert('Failed to create order.');
      }
    });
  }
}
