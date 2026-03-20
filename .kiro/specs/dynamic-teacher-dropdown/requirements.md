# Requirements Document

## Introduction

This feature replaces the hardcoded teacher dropdown in the course creation/update form with a dynamic dropdown that fetches teachers from the backend API. Currently, the eduLearn Angular 19 platform has a single hardcoded teacher option (Ahmed Hassan) in the course form. This feature will enable administrators to select from all available teachers in the system by fetching them from the `/teacher` endpoint.

## Glossary

- **Course_Form**: The Angular reactive form used for creating and updating courses in the dashboard
- **Teacher_Service**: An Angular service responsible for fetching teacher data from the backend API
- **Teacher_Dropdown**: The dropdown UI component that displays the list of available teachers
- **Course_Service**: The existing Angular service that handles course-related API operations
- **Backend_API**: The REST API running at http://localhost:3000 that provides teacher and course data
- **Teacher_Response**: The JSON response from the `/teacher` endpoint containing an array of teacher objects
- **Dashboard_Component**: The DashboardCoursesCreateComponent that manages the course creation/update form

## Requirements

### Requirement 1: Fetch Teachers from Backend

**User Story:** As an administrator, I want the system to fetch all available teachers from the backend, so that I can select any teacher when creating or updating a course.

#### Acceptance Criteria

1. THE Teacher_Service SHALL provide a method to fetch teachers from the `/teacher` endpoint
2. WHEN the Teacher_Service fetches teachers, THE Teacher_Service SHALL include the authorization token in the request headers
3. WHEN the Backend_API returns teacher data, THE Teacher_Service SHALL return an Observable containing the Teacher_Response
4. THE Teacher_Service SHALL use the base URL http://localhost:3000 for API requests
5. THE Teacher_Service SHALL follow the same authentication pattern as the Course_Service

### Requirement 2: Initialize Teacher Dropdown

**User Story:** As an administrator, I want the teacher dropdown to be populated automatically when I open the course form, so that I can immediately select a teacher without manual refresh.

#### Acceptance Criteria

1. WHEN the Dashboard_Component initializes, THE Dashboard_Component SHALL fetch the list of teachers
2. WHEN teachers are successfully fetched, THE Dashboard_Component SHALL populate the Teacher_Dropdown with the teacher data
3. THE Teacher_Dropdown SHALL include a default option with empty value and label "Select Instructor"
4. FOR EACH teacher in the Teacher_Response, THE Dashboard_Component SHALL create a dropdown option with the teacher's ID as the value
5. FOR EACH teacher in the Teacher_Response, THE Dashboard_Component SHALL display the teacher's username as the label
6. WHERE the teacher object contains firstName and lastName fields, THE Dashboard_Component SHALL display the concatenated full name instead of username

### Requirement 3: Handle Teacher Fetch Errors

**User Story:** As an administrator, I want to be notified if teachers cannot be loaded, so that I understand why the dropdown is empty and can take corrective action.

#### Acceptance Criteria

1. IF the teacher fetch request fails, THEN THE Dashboard_Component SHALL log the error to the console
2. IF the teacher fetch request fails, THEN THE Teacher_Dropdown SHALL display only the default "Select Instructor" option
3. WHEN a teacher fetch error occurs, THE Dashboard_Component SHALL allow the form to remain functional with the default dropdown state

### Requirement 4: Display Loading State

**User Story:** As an administrator, I want to see a loading indicator while teachers are being fetched, so that I know the system is working and not frozen.

#### Acceptance Criteria

1. WHEN the Dashboard_Component begins fetching teachers, THE Dashboard_Component SHALL set a loading state flag to true
2. WHILE teachers are being fetched, THE Teacher_Dropdown SHALL display a loading indicator or disabled state
3. WHEN the teacher fetch completes successfully or with error, THE Dashboard_Component SHALL set the loading state flag to false

### Requirement 5: Maintain Form Validation

**User Story:** As an administrator, I want the teacher selection to remain required, so that every course has an assigned instructor.

#### Acceptance Criteria

1. THE Course_Form SHALL maintain the required validator on the teacherId field
2. WHEN the form is submitted without a teacher selection, THE Course_Form SHALL prevent submission and mark the teacherId field as invalid
3. WHEN a teacher is selected from the Teacher_Dropdown, THE Course_Form SHALL update the teacherId field value with the selected teacher's ID

### Requirement 6: Support Edit Mode

**User Story:** As an administrator, I want the correct teacher to be pre-selected when editing an existing course, so that I can see the current instructor and change it if needed.

#### Acceptance Criteria

1. WHEN the Dashboard_Component loads in edit mode, THE Dashboard_Component SHALL fetch teachers before fetching course details
2. WHEN course details are loaded in edit mode, THE Course_Form SHALL pre-select the teacher matching the course's teacherId
3. WHEN the pre-selected teacher is not in the fetched teacher list, THE Teacher_Dropdown SHALL still display the selection using the course's existing teacher data

### Requirement 7: Preserve Existing Form Behavior

**User Story:** As an administrator, I want all other form functionality to work exactly as before, so that only the teacher dropdown changes and nothing else breaks.

#### Acceptance Criteria

1. THE Dashboard_Component SHALL continue to fetch subjects using the existing fetchSubjects method
2. THE Dashboard_Component SHALL continue to handle file uploads for course images
3. THE Dashboard_Component SHALL continue to submit course data using the existing createCourse and updateCourse methods
4. THE Course_Form SHALL continue to include title, description, subjectId, and teacherId fields with the same validation rules
