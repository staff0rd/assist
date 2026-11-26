import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import type { BrowserTool } from "./BrowserTool";
import { parseStepVerdict } from "./parseStepVerdict";
import type { Verdict } from "./StepVerdict";
import { toolResult } from "./toolResult";

type Recorded = { verdict: Verdict; note: string };

export function createVerdictTool(
	onVerdict: (verdict: Recorded) => Promise<void>,
) {
	return tool(
		"record_verdict",
		"Record this step's verdict once you have checked the expectation",
		{
			verdict: z.enum(["pass", "fail", "unsure"]),
			note: z.string().describe("What you saw that led to the verdict"),
		},
		(args) =>
			toolResult(async () => {
				await onVerdict(parseStepVerdict(args));
				return "Recorded. The step is done; stop here.";
			}),
	) as BrowserTool;
}
