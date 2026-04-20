import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/course.service';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-create-lesson',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavBarComponent],
  templateUrl: './create-lesson.component.html'
})
export class CreateLessonComponent implements OnInit {
  courseId: string = '';
  lessonId: string | null = null;
  lessonForm!: FormGroup;
  isEditing: boolean = false;
  isSaving: boolean = false;
  courseTitle: string = 'Course';
  selectedFile: File | null = null;
  uploadProgress: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private courseService: CourseService,
    private location: Location
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.lessonId = this.route.snapshot.paramMap.get('lessonId');
    this.isEditing = !!this.lessonId;

    this.initForm();

    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe({
        next: (res: any) => {
          this.courseTitle = res.data?.course?.title || res.data?.title || res.title || 'Course';
        }
      });
    }

    if (this.isEditing && this.lessonId) {
      this.fetchLesson();
    }
  }

  initForm() {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      isFree: [false],
      order: [1, [Validators.required, Validators.min(1)]]
    });

    // Auto-sync isFree and price
    this.lessonForm.get('isFree')?.valueChanges.subscribe(val => {
      if (val) {
        this.lessonForm.patchValue({ price: 0 }, { emitEvent: false });
      }
    });
    this.lessonForm.get('price')?.valueChanges.subscribe(val => {
      if (val > 0) {
        this.lessonForm.patchValue({ isFree: false }, { emitEvent: false });
      } else if (val === 0) {
         this.lessonForm.patchValue({ isFree: true }, { emitEvent: false });
      }
    });
  }

  fetchLesson() {
    this.lessonService.getLessonById(this.lessonId!).subscribe({
      next: (res: any) => {
        const lesson = res.data?.lesson || res.Result || res.data || res;
        this.lessonForm.patchValue({
          title: lesson.title,
          description: lesson.description,
          price: lesson.price,
          isFree: lesson.isFree,
          order: lesson.order
        });
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveLesson() {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;
    const formVal = this.lessonForm.value;
    
    if (this.selectedFile) {
        this.lessonService.getUploadUrl(this.courseId, {
            originalname: this.selectedFile.name,
            ContentType: this.selectedFile.type || 'video/mp4'
        }).subscribe({
            next: (res: any) => {
                const uploadData = res.data || res.Result || res;
                const presignedUrl = uploadData.URL || uploadData.url;
                const videoKey = uploadData.Key || uploadData.key;
                
                this.uploadProgress = 0;
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', presignedUrl, true);
                if (this.selectedFile!.type) {
                    xhr.setRequestHeader('Content-Type', this.selectedFile!.type);
                }

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        this.uploadProgress = Math.round((e.loaded / e.total) * 100);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        this.uploadProgress = 100;
                        this.submitLessonData(formVal, videoKey);
                    } else {
                        console.error('S3 Upload failed');
                        this.isSaving = false;
                        this.uploadProgress = 0;
                    }
                };

                xhr.onerror = () => {
                    console.error('S3 Upload error');
                    this.isSaving = false;
                    this.uploadProgress = 0;
                };

                xhr.send(this.selectedFile);
            },
            error: (err) => {
                console.error('Error getting upload URL', err);
                this.isSaving = false;
            }
        });
    } else {
        this.submitLessonData(formVal, undefined);
    }
  }

  submitLessonData(formVal: any, videoKey?: string) {
    const payload: any = {
      title: formVal.title,
      description: formVal.description,
      price: formVal.price,
      isFree: formVal.isFree,
      order: formVal.order,
    };
    
    if (videoKey) {
        payload.videoKey = videoKey;
    } else if (!this.isEditing) {
        payload.videoKey = ''; 
    }

    if (this.isEditing) {
      this.lessonService.updateLesson(this.lessonId!, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.goBack();
        },
        error: () => this.isSaving = false
      });
    } else {
      this.lessonService.createLesson(this.courseId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.goBack();
        },
        error: () => this.isSaving = false
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
