import { Routes } from '@angular/router';
import { QuestionsComponent } from './pages/questions/questions.component';
import { CreateQuestionComponent } from './pages/questions/create-question/create-question.component';
import { DiscoveryComponent } from './pages/discovery/discovery.component';


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
  {
    path: 'reset-failed',
    loadComponent: () =>
      import('./pages/reset-failed/reset-failed.component').then((m) => m.ResetFailedComponent),
  },
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./pages/confirm-email/confirm-email.component').then((m) => m.ConfirmEmailComponent),
  },
  {
    path: 'confirm-success',
    loadComponent: () =>
      import('./pages/confirm-success/confirm-success.component').then((m) => m.ConfirmSuccessComponent),
  },
  {
    path: 'confirm-failed',
    loadComponent: () =>
      import('./pages/confirm-failed/confirm-failed.component').then((m) => m.ConfirmFailedComponent),
  },

  // ─── App Pages ────────────────────────────────────────────
  {
    path: 'discovery',
    loadComponent: () => import('./pages/discovery/discovery.component').then((m) => m.DiscoveryComponent),
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
      import(
        './pages/dashboard/dashboard-subjects/dashboard-subjects.component'
      ).then((m) => m.DashboardSubjectsComponent),
  },
  {
    path: 'dashboard/orders',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-orders/dashboard-orders.component').then((m) => m.DashboardOrdersComponent),
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
    path: 'manage-lesson/:courseId',
    loadComponent: () =>
      import('./pages/manage-lesson/manage-lesson.component').then((m) => m.ManageLessonComponent),
  },
  {
    path: 'lesson-player/:courseId',
    loadComponent: () =>
      import('./pages/lesson-player/lesson-player.component').then((m) => m.LessonPlayerComponent),
  },
  {
    path: 'lesson-player/:courseId/:lessonId',
    loadComponent: () =>
      import('./pages/lesson-player/lesson-player.component').then((m) => m.LessonPlayerComponent),
  },
  {
    path: 'create-lesson/:courseId',
    loadComponent: () =>
      import('./pages/create-lesson/create-lesson.component').then((m) => m.CreateLessonComponent),
  },
  {
    path: 'edit-lesson/:courseId/:lessonId',
    loadComponent: () =>
      import('./pages/create-lesson/create-lesson.component').then((m) => m.CreateLessonComponent),
  },
  {
    path: 'create-quiz/:courseId/:lessonId',
    loadComponent: () =>
      import('./pages/create-quiz/create-quiz.component').then((m) => m.CreateQuizComponent),
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
  {
    path: 'questions',
    component: QuestionsComponent,
  },
  {
    path: 'questions/create',
    component: CreateQuestionComponent,
  },
  {
    path: 'take-quiz/:quizId',
    loadComponent: () =>
      import('./pages/take-quiz/take-quiz.component').then((m) => m.TakeQuizComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'my-courses',
    loadComponent: () =>
      import('./pages/my-courses/my-courses.component').then((m) => m.MyCoursesComponent),
  },
  {
    path: 'order-review/:orderId',
    loadComponent: () =>
      import('./pages/order-review/order-review.component').then((m) => m.OrderReviewComponent),
  },

  {
    path: 'student-results',
    loadComponent: () =>
      import('./pages/student-results/student-results.component').then((m) => m.StudentResultsComponent),
  },

  // Wildcard: redirect unknown URLs to login
  { path: '**', redirectTo: 'login' },
];

