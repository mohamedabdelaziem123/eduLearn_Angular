import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../enviroment/enviroment';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../../../components/nav-bar/nav-bar.component';
import { SideBarComponent } from '../../../components/side-bar/side-bar.component';
import { CourseService } from '../../../services/course.service';
import { TeacherService } from '../../../services/teacher.service';
import { DropdownMenuComponent } from '../../../components/ui/dropdown-menu/dropdown-menu.component';

@Component({
    selector: 'app-dashboard-courses-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, NavBarComponent, SideBarComponent, DropdownMenuComponent],
    templateUrl: './dashboard-courses-create.component.html'
})
export class DashboardCoursesCreateComponent implements OnInit {
    courseForm: FormGroup;
    isEditMode: boolean = false;
    courseId: string | null = null;
    subjects: any[] = [];
    subjectOptions: { value: string, label: string }[] = [];
    teacherOptions: { value: string, label: string }[] = [
        { value: '', label: 'Select Instructor' }
    ];
    isLoadingTeachers: boolean = false;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;
    isSubmitting: boolean = false;

    // Stats for edit mode
    courseStatus: string = 'DRAFT';
    lastModified: string = 'Never';

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private courseService: CourseService,
        private teacherService: TeacherService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.courseForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            subjectId: ['', Validators.required],
            teacherId: ['', Validators.required], // Still required conceptually, mapped to Ahmed Hassan for now
        });
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.fetchTeachers();
            this.fetchSubjects();

            this.route.paramMap.subscribe(params => {
                const id = params.get('courseId');
                if (id) {
                    this.isEditMode = true;
                    this.courseId = id;
                    this.fetchCourseDetails(id);
                }
            });
        }
    }

  fetchSubjects() {
      this.courseService.getSubjects().subscribe({
          next: (res: any) => {
              const subjectsArray = Array.isArray(res.data) ? res.data : (res.data?.subjects || []);
              if (subjectsArray.length >= 0) {
                  this.subjects = subjectsArray;
                  this.subjectOptions = [
                      { value: '', label: 'Select Specialty' },
                      ...this.subjects.map(s => ({ value: s._id, label: s.name.charAt(0).toUpperCase() + s.name.slice(1) }))
                  ];
              }
          },

            error: (err) => console.error('Error fetching subjects', err)
        });
    }

    fetchTeachers() {
        this.isLoadingTeachers = true;
        this.teacherService.getAllTeachers().subscribe({

            next: (res) => {
                if (res.data && Array.isArray(res.data)) {
                    const teachers = res.data;
                    this.teacherOptions = [
                        { value: '', label: 'Select Instructor' },
                        ...teachers.map(teacher => ({
                            value: teacher._id,
                            label: teacher.firstName && teacher.lastName 
                                ? `${teacher.firstName} ${teacher.lastName}`
                                : teacher.username
                        }))
                    ];
                }
            },
            error: (err) => {
                console.error('Error fetching teachers', err);
                this.teacherOptions = [{ value: '', label: 'Select Instructor' }];
            },
            complete: () => {
                this.isLoadingTeachers = false;
            }
        });
    }

    fetchCourseDetails(id: string) {
        this.courseService.getCourseById(id).subscribe({
            next: (res) => {
                if (res.data) {
                    const course = res.data;

                    this.courseForm.patchValue({
                        title: course.title,
                        description: course.description,
                        subjectId: course.subjectId?._id || course.subjectId,
                        teacherId: course.teacherId?._id || course.teacherId
                    });

                    this.courseStatus = course.status ? course.status.toUpperCase() : 'UNKNOWN';
                    this.lastModified = course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Unknown';

                    if (course.image) {
                        // Check if it's already a full URL or needs prepending
                        this.imagePreview = course.image.startsWith('http') ? course.image : `${environment.cdnUrl}/${course.image}`;
                    }
                }
            },
            error: (err) => console.error('Error fetching course details', err)
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }

            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e) => this.imagePreview = reader.result;
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.courseForm.invalid) {
            this.courseForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const formData = new FormData();
        const formValues = this.courseForm.value;

        formData.append('title', formValues.title);
        formData.append('description', formValues.description);
        formData.append('subjectId', formValues.subjectId);
        formData.append('teacherId', formValues.teacherId);

        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }

        if (this.isEditMode && this.courseId) {
            // It's an update
            this.courseService.updateCourse(this.courseId, formData).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.router.navigate(['/dashboard/courses']);
                },
                error: (err) => {
                    console.error('Error updating course', err);
                    alert('Error updating course. Please check the console.');
                    this.isSubmitting = false;
                }
            });
        } else {
            // It's a creation
            if (!this.selectedFile) {
                // Optionally, prompt user to select image 
                // alert("Please select an image for the new course.");
                // return;
            }

            this.courseService.createCourse(formData).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.router.navigate(['/dashboard/courses']);
                },
                error: (err) => {
                    console.error('Error creating course', err);
                    alert('Error creating course. Please check the console.');
                    this.isSubmitting = false;
                }
            });
        }
    }
}
