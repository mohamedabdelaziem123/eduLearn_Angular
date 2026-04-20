import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { LessonService } from '../../services/lesson.service';
import { environment } from '../../enviroment/enviroment';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-manage-lesson',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './manage-lesson.component.html'
})
export class ManageLessonComponent implements OnInit {
  courseId: string = '';
  course: any = null;
  lessons: any[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private lessonService: LessonService,
    private location: Location
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    if (this.courseId) {
      this.fetchData();
    }
  }

  fetchData() {
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
                    console.log('[ManageLesson] Sample lesson object keys:', Object.keys(this.lessons[0]));
                    console.log('[ManageLesson] lesson._id:', this.lessons[0]._id, 'lesson.id:', this.lessons[0].id);
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

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://placehold.co/600x400';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${environment.cdnUrl}/${image}`;
  }

  goBack() {
    this.location.back();
  }

  navigateToAdd() {
    this.router.navigate(['/create-lesson', this.courseId]);
  }

  navigateToEdit(lessonId: string) {
    this.router.navigate(['/edit-lesson', this.courseId, lessonId]);
  }

  toggleLessonVisibility(lesson: any) {
    this.lessonService.toggleVisibility(lesson._id || lesson.id).subscribe({
        next: (res: any) => {
            // Optimistically update or consume response
            const updatedLesson = res.data?.lesson || res.Result || res.data || res;
            if (updatedLesson && updatedLesson.isVisible !== undefined) {
                lesson.isVisible = updatedLesson.isVisible;
            } else {
                lesson.isVisible = (lesson.isVisible === false) ? true : false;
            }
        },
        error: (err) => {
            console.error('Error toggling visibility', err);
        }
    });
  }

  deleteLesson(lessonId: string) {
    if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      this.lessonService.deleteLesson(lessonId).subscribe({
        next: () => {
          this.lessons = this.lessons.filter(l => (l._id || l.id) !== lessonId);
        },
        error: (err) => {
          console.error('Error deleting lesson', err);
        }
      });
    }
  }

  viewCourse() {
    if (this.lessons && this.lessons.length > 0) {
      this.router.navigate(['/lesson-player', this.courseId, this.lessons[0]._id || this.lessons[0].id]);
    } else {
      alert('This course has no lessons to view yet.');
    }
  }

  navigateToCreateQuiz(lesson: any) {
    const lessonId = lesson._id || lesson.id;
    console.log('[ManageLesson] navigateToCreateQuiz lessonId:', lessonId, 'courseId:', this.courseId);
    this.router.navigate(['/create-quiz', this.courseId, lessonId]);
  }
}
