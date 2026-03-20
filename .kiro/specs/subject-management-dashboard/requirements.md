# Requirements Document

## Introduction

The Subject Management Dashboard enables administrators to view, manage, and organize subjects within the eduLearn Angular 19 platform. This feature provides a centralized interface for subject administration, including viewing subject details, editing subject information, and removing subjects from the system. The dashboard follows existing patterns established by the teacher and course dashboards.

## Glossary

- **Subject_Dashboard**: The administrative interface for managing subjects
- **Subject**: An academic subject entity containing name, description, and associated courses
- **Subject_Table**: The tabular display component showing subject records
- **Subject_API**: The backend REST API endpoints for subject operations
- **Pagination_Control**: The client-side pagination mechanism limiting display to 4 subjects per page
- **Edit_Dialog**: The interface allowing modification of subject properties
- **Delete_Confirmation**: The dialog requesting user confirmation before subject deletion
- **Stats_Cards**: The dashboard widgets displaying aggregate subject metrics
- **Navigation_Bar**: The NavBarComponent used across dashboard pages
- **Side_Bar**: The SideBarComponent used across dashboard pages

## Requirements

### Requirement 1: Subject Dashboard Page

**User Story:** As an administrator, I want to access a dedicated subjects dashboard, so that I can manage all subjects in one place.

#### Acceptance Criteria

1. THE Subject_Dashboard SHALL be accessible at the route "/dashboard/subjects"
2. WHEN the Subject_Dashboard loads, THE Subject_Dashboard SHALL display the Navigation_Bar component
3. WHEN the Subject_Dashboard loads, THE Subject_Dashboard SHALL display the Side_Bar component
4. WHEN the Subject_Dashboard loads, THE Subject_Dashboard SHALL fetch all subjects from the Subject_API GET endpoint

### Requirement 2: Subject List Display

**User Story:** As an administrator, I want to view all subjects in a table format, so that I can quickly scan subject information.

#### Acceptance Criteria

1. THE Subject_Table SHALL display columns for Subject Name, Description, Courses count, and Actions
2. WHEN a subject has associated courses, THE Subject_Table SHALL display the count of courses in the Courses column
3. WHEN a subject has no associated courses, THE Subject_Table SHALL display "0" in the Courses column
4. THE Subject_Table SHALL display a subject icon or emoji for each subject row
5. WHEN the Subject_API returns subjects, THE Subject_Table SHALL render one row per subject

### Requirement 3: Client-Side Pagination

**User Story:** As an administrator, I want subjects paginated in manageable chunks, so that I can navigate large subject lists easily.

#### Acceptance Criteria

1. THE Pagination_Control SHALL display 4 subjects per page
2. THE Pagination_Control SHALL display the text "Showing X of Y subjects" where X is the count of currently visible subjects and Y is the total subject count
3. WHEN the total subject count exceeds 4, THE Pagination_Control SHALL provide navigation controls to view additional pages
4. WHEN a user navigates to a different page, THE Subject_Table SHALL display the subjects for that page

### Requirement 4: Subject Creation Navigation

**User Story:** As an administrator, I want to create new subjects, so that I can expand the subject catalog.

#### Acceptance Criteria

1. THE Subject_Dashboard SHALL display a "Create New Subject" button
2. WHEN the "Create New Subject" button is clicked, THE Subject_Dashboard SHALL navigate to the subject creation form route

### Requirement 5: Subject Editing

**User Story:** As an administrator, I want to edit existing subjects, so that I can update subject information.

#### Acceptance Criteria

1. THE Subject_Table SHALL display an Edit action button for each subject row
2. WHEN the Edit action button is clicked, THE Edit_Dialog SHALL display the current subject name and description
3. WHEN the Edit_Dialog is submitted with valid data, THE Subject_Dashboard SHALL send a PATCH request to the Subject_API with the subject ID and updated fields
4. WHEN the Subject_API returns a successful update response, THE Subject_Dashboard SHALL refresh the subject list
5. WHEN the Subject_API returns an error response, THE Subject_Dashboard SHALL display an error message to the user

### Requirement 6: Subject Deletion

**User Story:** As an administrator, I want to delete subjects, so that I can remove obsolete or incorrect subjects.

#### Acceptance Criteria

1. THE Subject_Table SHALL display a Delete action button for each subject row
2. WHEN the Delete action button is clicked, THE Delete_Confirmation SHALL display a confirmation dialog
3. WHEN the Delete_Confirmation is confirmed, THE Subject_Dashboard SHALL send a DELETE request to the Subject_API with the subject ID
4. WHEN the Subject_API returns a successful deletion response, THE Subject_Dashboard SHALL remove the subject from the Subject_Table
5. WHEN the Subject_API returns an error response, THE Subject_Dashboard SHALL display an error message to the user
6. WHEN the Delete_Confirmation is cancelled, THE Subject_Dashboard SHALL not send a DELETE request

### Requirement 7: Dashboard Statistics

**User Story:** As an administrator, I want to see aggregate statistics about subjects, so that I can understand the overall state of the subject catalog.

#### Acceptance Criteria

1. THE Stats_Cards SHALL display a "Total Subjects" card showing the count of all subjects
2. WHERE the Subject_API provides active student data, THE Stats_Cards SHALL display an "Active Students" card
3. WHERE the Subject_API provides lesson data, THE Stats_Cards SHALL display a "Total Lessons" card
4. WHEN the subject list is updated, THE Stats_Cards SHALL recalculate and display updated statistics

### Requirement 8: Loading and Error States

**User Story:** As an administrator, I want clear feedback during data operations, so that I understand the system status.

#### Acceptance Criteria

1. WHEN the Subject_Dashboard is fetching subjects from the Subject_API, THE Subject_Dashboard SHALL display a loading indicator
2. WHEN the Subject_API request fails, THE Subject_Dashboard SHALL display an error message describing the failure
3. WHEN a subject update operation is in progress, THE Edit_Dialog SHALL display a loading indicator
4. WHEN a subject deletion operation is in progress, THE Delete_Confirmation SHALL display a loading indicator

### Requirement 9: Service Integration

**User Story:** As a developer, I want to reuse existing service patterns, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. THE Subject_Dashboard SHALL use the TeacherService getSubjects method to fetch subjects
2. THE Subject_Dashboard SHALL implement an AdminService pattern for subject update operations
3. THE Subject_Dashboard SHALL implement an AdminService pattern for subject deletion operations
4. WHEN subjects have associated images, THE Subject_Dashboard SHALL construct CloudFront URLs for image display

### Requirement 10: UI Consistency

**User Story:** As an administrator, I want the subjects dashboard to match existing dashboard patterns, so that I have a consistent user experience.

#### Acceptance Criteria

1. THE Subject_Dashboard SHALL use Material icons for UI elements consistent with dashboard-teachers and dashboard-courses
2. THE Subject_Dashboard SHALL follow the same layout structure as dashboard-teachers and dashboard-courses
3. THE Subject_Dashboard SHALL use the same styling patterns as dashboard-teachers and dashboard-courses
4. THE Subject_Table SHALL use the same table styling as existing dashboard tables
