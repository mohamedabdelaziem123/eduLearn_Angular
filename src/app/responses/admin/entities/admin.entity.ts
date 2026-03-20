import { EntityId } from '../../types';



export interface createTeacherResponse {
  teacherId: EntityId;
  email: string;
}

export interface DashboardUserCounts {
  students: number;
  teachers: number;
  admins: number;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalPaidOrders: number;
  users: DashboardUserCounts;
  totalCourses: number;
  totalLessonsSold: number;
  blockedStudents: number;
}
