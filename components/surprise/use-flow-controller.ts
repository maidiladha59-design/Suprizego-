"use client";

import { useCallback, useState } from "react";
import type { FlowStepId } from "@/lib/flow";

export function useFlowController(steps: readonly FlowStepId[]) {
  const [activeId, setActiveId] = useState<FlowStepId>(steps[0] ?? "envelope");
  const [runId, setRunId] = useState(0);

  const goTo = useCallback(
    (id: FlowStepId) => {
      if (steps.includes(id)) setActiveId(id);
    },
    [steps],
  );

  const next = useCallback(() => {
    setActiveId((current) => {
      const index = steps.indexOf(current);
      return steps[Math.min(index + 1, steps.length - 1)] ?? "envelope";
    });
  }, [steps]);

  const restart = useCallback(() => {
    setActiveId(steps[0] ?? "envelope");
    setRunId((current) => current + 1);
  }, [steps]);

  return { activeId, runId, goTo, next, restart };
}
