# Implementation Plan: Dynamic Teacher Dropdown

## Overview

This implementation plan converts the hardcoded teacher dropdown in the course creation/update form into a dynamic system that fetches teachers from the backend API. The implementation follows Angular best practices by creating a dedicated TeacherService and modifying the DashboardCoursesCreateComponent to handle loading states, error handling, and dynamic data population.

## Tasks

- [x] 1. Create TeacherService with API integration
  - [x] 1.1 Create teacher.service.ts with HttpClient and AuthService dependencies
    - Generate service file in `src/app/services/` directory
    - Inject HttpClient and AuthService
    - Define base URL constant as `http://localhost:3000`
    - _Requirements: 1.1, 1.4_
  
  - [x] 1.2 Implement getHeaders() private method
    - Retrieve access token from AuthService
    - Create HttpHeaders with Authorization Bearer token
    - Follow the same pattern as CourseService.getHeaders()
    - _Requirements: 1.2, 1.5_
  
  - [x] 1.3 Implement getTeachers() method
    - Make GET request to `/teacher` endpoint
    - Include authorization headers using getHeaders()
    - Return Observable<TeacherResponse>
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 1.4 Write property test for authorization header inclusion
    - **Property 1: Authorization Header Inclusion**
    - **Validates: Requirements 1.2**
    - Generate random tokens and verify Authorization header format
    - _Requirements: 1.2_

- [x] 2. Modify DashboardCoursesCreateComponent for dynamic teacher loading
  - [x] 2.1 Add TeacherService dependency and loading state property
    - Inject TeacherService in constructor
    - Add `isLoadingTeachers: boolean = false` property
    - Initialize teacherOptions with only default "Select Instructor" option
    - _Requirements: 2.1, 2.3, 4.1_
  
  - [x] 2.2 Implement fetchTeachers() method
    - Set isLoadingTeachers to true at start
    - Call teacherService.getTeachers()
    - Transform teacher data to dropdown options format
    - Handle firstName/lastName vs username for display labels
    - Handle errors by logging to console
    - Set isLoadingTeachers to false in finally block
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 3.1, 3.2, 4.1, 4.3_
  
  - [ ]* 2.3 Write property test for teacher data transformation
    - **Property 2: Teacher Data Transformation**
    - **Validates: Requirements 2.2, 2.4, 2.5, 2.6**
    - Generate random teacher arrays and verify correct option mapping
    - _Requirements: 2.2, 2.4, 2.5, 2.6_
  
  - [ ]* 2.4 Write property test for error state handling
    - **Property 3: Error State Handling**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Generate random errors and verify dropdown maintains default option
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.5 Write property test for loading state lifecycle
    - **Property 4: Loading State Lifecycle**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Verify loading flag is true during fetch and false after completion
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Update component initialization sequence
  - [x] 3.1 Modify ngOnInit() to call fetchTeachers()
    - Add fetchTeachers() call at the beginning of ngOnInit()
    - Ensure teachers are fetched before checking edit mode
    - Maintain existing fetchSubjects() call
    - _Requirements: 2.1, 6.1, 7.1_
  
  - [x] 3.2 Verify edit mode pre-selection works with dynamic teachers
    - Ensure fetchCourseDetails() is called after teachers are loaded
    - Verify patchValue() correctly pre-selects teacher in edit mode
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 3.3 Write property test for edit mode pre-selection
    - **Property 7: Edit Mode Pre-selection**
    - **Validates: Requirements 6.2**
    - Generate random course objects and verify correct teacher pre-selection
    - _Requirements: 6.2_

- [x] 4. Update template with loading state
  - [x] 4.1 Add loading indicator to teacher dropdown
    - Bind disabled state to isLoadingTeachers flag
    - Add visual loading indicator (spinner or text) when isLoadingTeachers is true
    - Ensure dropdown remains functional after loading completes
    - _Requirements: 4.2_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Verify form validation and submission behavior
  - [x] 6.1 Verify teacherId field maintains required validator
    - Test form submission with empty teacherId
    - Verify form.invalid is true when teacherId is empty
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 6.2 Write property test for form validation enforcement
    - **Property 5: Form Validation Enforcement**
    - **Validates: Requirements 5.2**
    - Generate random form states with invalid teacherId
    - _Requirements: 5.2_
  
  - [x] 6.3 Verify teacher selection updates form value
    - Test dropdown change event updates courseForm.value.teacherId
    - Verify selected teacher ID is included in form submission
    - _Requirements: 5.3_
  
  - [ ]* 6.4 Write property test for teacher selection updates
    - **Property 6: Teacher Selection Updates Form**
    - **Validates: Requirements 5.3**
    - Generate random teacher IDs and verify form updates correctly
    - _Requirements: 5.3_

- [x] 7. Verify existing functionality is preserved
  - [x] 7.1 Test subject dropdown still works correctly
    - Verify fetchSubjects() is still called
    - Verify subject dropdown populates correctly
    - _Requirements: 7.1_
  
  - [x] 7.2 Test file upload functionality
    - Verify image upload still works
    - Verify file handling logic is unchanged
    - _Requirements: 7.2_
  
  - [x] 7.3 Test course creation and update submission
    - Verify createCourse() works with dynamic teacher selection
    - Verify updateCourse() works with dynamic teacher selection
    - Verify all form fields are included in submission
    - _Requirements: 7.3, 7.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- The implementation maintains backward compatibility with existing form behavior
- Loading states provide user feedback during async operations
- Error handling ensures the form remains functional even when teacher fetch fails
