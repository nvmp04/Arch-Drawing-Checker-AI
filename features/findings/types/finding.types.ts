import type { FindingStatus, ReasoningGroup } from "@/shared/constants/enums";
export type Finding = { id: string; status: FindingStatus; group: ReasoningGroup };
