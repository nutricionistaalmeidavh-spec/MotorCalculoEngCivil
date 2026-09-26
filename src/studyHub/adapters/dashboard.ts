import { validateDashboardLayout, type DashboardItem } from "../../../vendor/artisys/dashboard/index.mjs";

export function createStudyDashboardLayout(): DashboardItem[] {
  return validateDashboardLayout([
    { id: "dashboard", x: 0, y: 0, w: 2, h: 1 },
    { id: "pdf", x: 2, y: 0, w: 2, h: 2 },
    { id: "annotations", x: 0, y: 1, w: 2, h: 2 },
    { id: "workflow", x: 2, y: 2, w: 2, h: 2 },
    { id: "search", x: 0, y: 3, w: 2, h: 1 },
    { id: "storage", x: 2, y: 4, w: 1, h: 1 },
    { id: "pwa", x: 3, y: 4, w: 1, h: 1 },
  ]);
}
