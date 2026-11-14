import { previewWaitInstruction } from "../sessions/shared/previewWaitInstruction";
import type { AdviceContext } from "./AdviceContext";

export const previewWaitAdvice: Record<
	string,
	(context: AdviceContext) => string
> = {
	previewWait: ({ sdkSession }) => previewWaitInstruction(sdkSession),
	previewRevise: ({ sdkSession }) =>
		sdkSession
			? "To revise a still-pending preview, re-run it; the earlier one is superseded and delivers nothing."
			: "To revise a still-pending preview, re-run it directly without stopping the earlier task; that task then exits 0 as superseded — ignore its result.",
};
