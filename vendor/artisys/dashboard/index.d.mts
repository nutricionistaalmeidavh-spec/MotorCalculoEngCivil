export interface DashboardItem { id: string; x: number; y: number; w: number; h: number; [key: string]: unknown; }
export function validateDashboardLayout<T extends DashboardItem>(layout: T[]): T[];
