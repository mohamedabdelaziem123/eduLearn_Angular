import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/courses/edit/:courseId',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/subjects/edit/:subjectId',
    renderMode: RenderMode.Client
  },
  {
    path: 'manage-lesson/:courseId',
    renderMode: RenderMode.Client
  },
  {
    path: 'lesson-player/:courseId',
    renderMode: RenderMode.Client
  },
  {
    path: 'lesson-player/:courseId/:lessonId',
    renderMode: RenderMode.Client
  },
  {
    path: 'create-lesson/:courseId',
    renderMode: RenderMode.Client
  },
  {
    path: 'edit-lesson/:courseId/:lessonId',
    renderMode: RenderMode.Client
  },
  {
    path: 'create-quiz/:courseId/:lessonId',
    renderMode: RenderMode.Client
  },
  {
    path: 'teacher-result/:attemptId',
    renderMode: RenderMode.Client
  },
  {
    path: 'my-courses',
    renderMode: RenderMode.Client
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client
  },
  {
    path: 'order-review/:orderId',
    renderMode: RenderMode.Client
  },
  {
    path: 'take-quiz/:quizId',
    renderMode: RenderMode.Client
  },
  {
    path: 'student-results',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
