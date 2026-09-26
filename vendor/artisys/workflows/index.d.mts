export interface WorkflowNode { id: string; type: string; data?: Record<string, unknown>; position?: { x: number; y: number }; }
export interface WorkflowEdge { id?: string; source: string; target: string; data?: Record<string, unknown>; }
export interface Workflow { id?: string; nodes: WorkflowNode[]; edges: WorkflowEdge[]; }
export function validateWorkflow<T extends Workflow>(workflow: T, options?: { allowDangling?: boolean }): T;
export function topologicalOrder(workflow: Workflow): string[];
