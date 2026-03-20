import { Routes } from '@angular/router';


export const routes: Routes = [
  // Default route redirects to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ─── Auth Pages ───────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((m) => m.SignupComponent),
  },

  // ─── Password Reset Flow ──────────────────────────────────
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'otp-verification',
    loadComponent: () =>
      import('./pages/otp-verification/otp-verification.component').then((m) => m.OtpVerificationComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'reset-success',
    loadComponent: () =>
      import('./pages/reset-success/reset-success.component').then((m) => m.ResetSuccessComponent),
  },

  // ─── App Pages ────────────────────────────────────────────
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard/students',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-students/dashboard-students.component').then((m) => m.DashboardStudentsComponent),
  },
  {
    path: 'dashboard/courses',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-courses/dashboard-courses.component').then((m) => m.DashboardCoursesComponent),
  },
  {
    path: 'dashboard/courses/create',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-courses-create/dashboard-courses-create.component').then((m) => m.DashboardCoursesCreateComponent),
  },
  {
    path: 'dashboard/courses/edit/:courseId',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-courses-create/dashboard-courses-create.component').then((m) => m.DashboardCoursesCreateComponent),
  },
  {
    path: 'dashboard/teachers',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-teachers/dashboard-teachers.component').then((m) => m.DashboardTeachersComponent),
  },
  {
    path: 'dashboard/teachers/create',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-teachers-create/dashboard-teachers-create.component').then((m) => m.DashboardTeachersCreateComponent),
  },
  {
    path: 'dashboard/subjects',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-subjects/dashboard-subjects.component').then((m) => m.DashboardSubjectsComponent),
  },
  {
    path: 'dashboard/subjects/create',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-subjects-create/dashboard-subjects-create.component').then((m) => m.DashboardSubjectsCreateComponent),
  },
  {
    path: 'dashboard/subjects/edit/:subjectId',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-subjects-create/dashboard-subjects-create.component').then((m) => m.DashboardSubjectsCreateComponent),
  },
  {
    path: 'dashboard/teacher-courses',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-teacher-courses/dashboard-teacher-courses.component').then((m) => m.DashboardTeacherCoursesComponent),
  },
  {
    path: 'teacher-quizzes',
    loadComponent: () =>
      import('./pages/teacher-quizzes/teacher-quizzes.component').then((m) => m.TeacherQuizzesComponent),
  },
  {
    path: 'teacher-result/:attemptId',
    loadComponent: () =>
      import('./pages/teacher-result/teacher-result.component').then((m) => m.TeacherResultComponent),
  },
  // TODO: Add more routes here (courses, lessons, profile…)

  // Wildcard: redirect unknown URLs to login
  { path: '**', redirectTo: 'login' },
];

