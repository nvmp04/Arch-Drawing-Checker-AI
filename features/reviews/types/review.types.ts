export type ReviewStatus = "draft" | "processing" | "completed"; export type ProcessingState = "idle" | "running" | "failed"; export type Review = { id: string; status: ReviewStatus };
