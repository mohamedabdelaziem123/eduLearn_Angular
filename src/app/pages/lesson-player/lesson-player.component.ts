import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { LessonService } from '../../services/lesson.service';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { AdminService } from '../../services/admin.service';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './lesson-player.component.html'
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  courseId: string = '';
  lessonId: string = '';
  course: any = null;
  lessons: any[] = [];
  currentLesson: any = null;
  streamUrl: string = '';
  isLoading: boolean = true;
  videoError: boolean = false;
  
  userProfile: any = null;
  isCurrentLessonLocked: boolean = false;
  isAddingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private lessonService: LessonService,
    private location: Location,
    private adminService: AdminService,
    private cartService: CartService
  ) {}

  ngOnInit() {


    this.fetchUserProfile();
    
    this.route.paramMap.subscribe(params => {
        this.courseId = params.get('courseId') || '';
        this.lessonId = params.get('lessonId') || '';
        
        if (this.courseId) {
            this.fetchCourseAndLessons();
        }
    });
  }

  fetchUserProfile() {
      this.adminService.getUserProfile().subscribe({
          next: (res: any) => {
              this.userProfile = res.data || res.user || res;
              console.log('[LessonPlayer] userProfile:', this.userProfile);
              console.log('[LessonPlayer] role:', this.userProfile?.role);
              // If we already loaded a lesson but couldn't verify access, re-evaluate now
              if (this.currentLesson) {
                  this.evaluateAccessAndLoadVideo(this.currentLesson._id || this.currentLesson.id);
              }
          },
          error: (err) => console.error('Error fetching user profile', err)
      });
  }

  get isTeacher(): boolean {
      const role = (localStorage.getItem('user_role') || '').toLowerCase();
      return role === 'teacher' || role === 'admin';
  }

  ngOnDestroy() {
  }

  fetchCourseAndLessons() {
    this.isLoading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data?.course || res.Result || res.data || res;
        
        this.lessonService.getLessonsByCourse(this.courseId).subscribe({
            next: (lRes: any) => {
                const fetchedLessons = lRes.data?.lessons || lRes.Result || lRes.data || lRes || [];
                this.lessons = Array.isArray(fetchedLessons) ? fetchedLessons : [];
                this.lessons.sort((a,b) => (a.order || 0) - (b.order || 0));
                
                if (this.lessons.length > 0) {
                    if (!this.lessonId) {
                        this.selectLesson(this.lessons[0]._id || this.lessons[0].id);
                    } else {
                        const targetLine = this.lessons.find((l) => (l._id || l.id) === this.lessonId);
                        this.currentLesson = targetLine || this.lessons[0];
                        if (!targetLine) this.lessonId = this.currentLesson._id || this.currentLesson.id;

                        this.evaluateAccessAndLoadVideo(this.lessonId);
                    }
                }
                this.isLoading = false;
            },
            error: (err) => {
              console.error('Error fetching lessons', err);
              this.isLoading = false;
            }
        });
      },
      error: (err) => {
        console.error('Error fetching course', err);
        this.isLoading = false;
      }
    });
  }

  isLessonLocked(lesson: any): boolean {
      if (!lesson) return false;
      if (lesson.isFree || lesson.price === 0) return false;

      // Teachers and admins always have full access
      const role = this.userProfile?.role?.toLowerCase();
      if (role === 'teacher' || role === 'admin') return false;
      
      const boughtLessons = this.userProfile?.boughtLessons || [];
      const hasBought = boughtLessons.some((id: string | any) => {
          const boughtId = typeof id === 'string' ? id : (id._id || id.id);
          return boughtId === (lesson._id || lesson.id);
      });
      return !hasBought;
  }

  evaluateAccessAndLoadVideo(lessonId: string) {
      if (!this.userProfile) {
          // Profile not loaded yet, just set current lesson and wait. 
          // fetchUserProfile will call this again when done.
          return; 
      }
      
      if (this.isLessonLocked(this.currentLesson)) {
          this.isCurrentLessonLocked = true;
          this.streamUrl = '';
          return;
      }
      
      this.isCurrentLessonLocked = false;
      this.loadVideo(lessonId);
  }

  loadVideo(lessonId: string) {
      this.streamUrl = '';
      this.videoError = false;
      this.lessonService.getStreamUrl(lessonId).subscribe({
          next: (res: any) => {
              const data = res.data || res.Result || res;
              this.streamUrl = data.url || data.URL;
          },
          error: (err) => {
              console.error('Failed to load video stream', err);
              this.videoError = true;
          }
      });
  }

  addToCart() {
      if (this.isAddingToCart || !this.currentLesson) return;
      this.isAddingToCart = true;
      
      this.cartService.addToCart({ lessonId: this.currentLesson._id || this.currentLesson.id }).subscribe({
          next: () => {
              this.isAddingToCart = false;
              alert('Lesson successfully added to your cart!');
          },
          error: (err) => {
              this.isAddingToCart = false;
              console.error('Error adding to cart', err);
              alert('Failed to add lesson to cart. It might already be there.');
          }
      });
  }

  startQuiz() {
      if (this.currentLesson?.quizId) {
          const rawQuizId = this.currentLesson.quizId._id || this.currentLesson.quizId.id || this.currentLesson.quizId;
          const currentLessonId = this.currentLesson._id || this.currentLesson.id;
          this.router.navigate(['/take-quiz', rawQuizId], { queryParams: { courseId: this.courseId, lessonId: currentLessonId } });
      }
  }

  selectLesson(newLessonId: string) {
      if (newLessonId && newLessonId !== this.lessonId) {
          this.router.navigate(['/lesson-player', this.courseId, newLessonId]);
      }
  }

  goBack() {
      this.location.back();
  }
}
