import { orderStatusEnum, RoleEnum } from "../../enums";


// ── Existing DTO ──────────────────────────────────────────────────────────



export interface CreateTeacherDto {
  
  
  firstName: string;

  
  
  lastName: string;

  
  
  email: string;

  
  
  password: string;

  
  
  degree: string;
}

// ── User query params ─────────────────────────────────────────────────────

export class GetUsersQueryDto {

  page?: number;


  size?: number;


  role?: RoleEnum;

  isBlocked?: boolean;

  
  

  search?: string;
}

// ── Order query params ────────────────────────────────────────────────────

export class GetOrdersQueryDto {

  page?: number;

  size?: number;


  status?: orderStatusEnum;
}
