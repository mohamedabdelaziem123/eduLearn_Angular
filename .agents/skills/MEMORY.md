---
description: Project Context and Memory
---
# eduLearn Angular App Context

## Overview
This is an educational platform frontend built with **Angular 19** (SSR enabled) and **Tailwind CSS**. It connects to a NestJS/TypeScript backend.

## Project Structure
All core application code is located under `src/app/`:
- **`pages/`**: Contains route-level components organized by feature.
  - Auth: `login`, `signup`, `forgot-password`, `otp-verification`, `reset-password`.
  - Roles/Dashboards: `dashboard/students`, `dashboard/teachers`, `dashboard/courses`, `dashboard/subjects`.
  - Features: `questions`, `teacher-quizzes`, `teacher-result`.
- **`services/`**: Services for API integration matching backend entities:
  - `admin`, `auth`, `cart`, `course`, `lesson`, `order`, `question`, `quiz`, `subject`, `teacher`, `user`.
- **`components/`**: Reusable shared UI.
- **`interceptors/`**: HTTP interceptors (e.g., attaching auth tokens, global loaders).
- **`directives/`**: Custom Angular directives.
- **`app.routes.ts`**: The central routing configuration mapping URLs to lazy-loaded page components.

## Key Domain Concepts & Relationships
The platform revolves around two main pillars:
1. **E-Learning Core**: 
   - `Subjects` contain `Courses`.
   - `Courses` contain `Lessons` and `Quizzes`.
   - `Quizzes` contain `Questions`.
   - Each entity has extensive CRUD and dashboard management pages.
2. **User Roles**: 
   - Admin
   - Teacher (can create courses, lessons, quizzes, evaluate attempts, view results).
   - Student (can view courses, take quizzes, view results).
3. **E-Commerce Core**:
   - `Cart` and `Orders` for course enrollments/purchases.

## Development Stack
- **Framework**: Angular v19.2
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer.
- **Testing**: Jasmine & Karma.

## Remember Context
When working on this project:
1. **Routing**: If adding a new page, add it to `app.routes.ts` and ensure it is neatly organized under the `pages/` directory.
2. **Services**: Use the existing `src/app/services` structure. If an entity exists, logic to fetch its data should go in its respective service file. Keep HTTP requests strongly typed.
3. **Styles**: Use standard Tailwind CSS utility classes inside component HTML or `app.component.css`. Avoid plain CSS targeting tags unless necessary.


## Database Agnostic ID Handling
- **Rule**: Since this project might switch back to MongoDB in the future (currently using PostgreSQL/TypeORM), all frontend ID handling MUST support both `_id` and `id` properties.
- **Interfaces**: Add `id?: string;` alongside `_id: string;` in all data interfaces (e.g., `Student`, `Subject`, `Course`, `Lesson`).
- **Template and Logic Handling**: Always use the fallback pattern `(item._id || item.id)` when referencing an ID, especially in `@for` loop `.track` functions, button actions, and array filtering.
