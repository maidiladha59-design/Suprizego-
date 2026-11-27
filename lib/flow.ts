export const FLOW_STEP_IDS = [
  "envelope",
  "photo",
  "letter",
  "question",
  "closing",
] as const;

export type FlowStepId = (typeof FLOW_STEP_IDS)[number];

export const FLOW_PROGRESS: Record<FlowStepId, number> = {
  envelope: 1,
  photo: 4,
  letter: 6,
  question: 7,
  closing: 8,
};

export const HERO_FLOW_STEPS: readonly FlowStepId[] = FLOW_STEP_IDS;
