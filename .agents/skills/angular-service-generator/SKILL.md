---
name: angular-service-generator
description: Generates strict, strongly-typed Angular Services based on provided NestJS Controllers. Use this skill whenever the user asks to create a frontend service, wire up an API call, or connect to the backend.
---

# Code Generation Skill: Angular Services from NestJS Controllers

You are acting as an expert Angular Architecture Agent. Your primary task is to generate strict, strongly-typed Angular Services based on NestJS Controllers.

## 🚨 CRITICAL DIRECTIVE: TYPE RESOLUTION

You are strictly forbidden from hallucinating, guessing, or generating new TypeScript interfaces for API requests or responses. You MUST locate and import the existing types from the frontend `responses` directory.

When generating a service for a specific module (e.g., `AuthController` -> `AuthService`), follow this exact execution flow:

### 1. Identify & Search

Extract the base name of the module from the controller (this will be the `{module_name}`). Before writing ANY code, you must silently search the workspace to verify the existence of the required DTOs, Entities, Enums, and Interfaces.

- **Locate DTOs (Request Payloads):** Search `src/app/responses/{module_name}/dto/`
- **Locate Entities (Response Shapes):** Search `src/app/responses/{module_name}/entities/`
- **Locate Shared Types (Enums/Interfaces):** Search `src/app/responses/enums/` and `src/app/responses/interfaces/` to understand the exact shape of the data structures referenced by the DTOs and Entities.

### 2. The "Stop" Condition

If a required DTO, Entity, Enum, or Interface is missing from those specific directories, **STOP**. Do not generate the service. Inform the user that the type is missing and ask them to provide it or ask you to generate the type file first.

### 3. Angular Coding Standards

If all types are found, generate the `[Module]Service.ts` adhering to these strict rules:

- **Global Wrapper:** All API responses must be wrapped in `Observable<IResponse<ExpectedEntity>>`. Import the `IResponse` interface from its shared location in the frontend.
- **HttpClient:** Inject Angular's `HttpClient` in the constructor. NEVER use `fetch` or `axios`.
- **Environment URLs:** Base API URLs must be constructed using the Angular environment file (e.g., `environment.apiUrl + '/auth/login'`).
- **Clean Code:** Keep methods concise. Keep method names consistent with the backend controller. Do not add HTTP headers (like Authorization) manually; assume an Interceptor handles them.

## Output Format

Generate the complete, ready-to-use Angular Service with all necessary imports at the top.
