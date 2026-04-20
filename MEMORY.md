# Project Memory & Rules

## Database Agnostic ID Handling
- **Rule**: Since this project might switch back to MongoDB in the future (currently using PostgreSQL/TypeORM), all frontend ID handling MUST support both `_id` and `id` properties.
- **Interfaces**: Add `id?: string;` alongside `_id: string;` in all data interfaces (e.g., `Student`, `Subject`, `Course`, `Lesson`).
- **Template and Logic Handling**: Always use the fallback pattern `(item._id || item.id)` when referencing an ID, especially in `@for` loop `.track` functions, button actions, and array filtering.

## Course Image CDN Handling
- **Rule**: Image URL paths returned by the database MUST ALWAYS be signed using `cdnService.getSignedUrl(image)` across all NestJS controller endpoints before returning to the frontend.
- **Pattern**: Because the DB could be Mongoose (where records are hydrated Documents) or TypeORM (where records are plain objects), you must safely extract a plain object before mutating properties. Always use the following pattern or similar when mapping responses in services:
  ```typescript
  const obj = entity.toJSON ? entity.toJSON() : entity;
  if (obj.image) obj.image = this.cdnService.getSignedUrl(obj.image);
  return obj;
  ```
  This guarantees that Mongoose Virtuals and plain object mutations work fluidly across both DB engines. Ensure this is done in all places where courses/assets are returned (e.g., `CourseService.getAllCourses`, `SubjectService.getCoursesBySubject`).
