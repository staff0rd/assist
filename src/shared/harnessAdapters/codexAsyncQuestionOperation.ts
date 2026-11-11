import { z } from "zod";
import type { NativeToolCall, ToolOperation } from "./types";

const inputSchema = z.object({
	questions: z
		.array(
			z.object({
				title: z.string().min(1),
				options: z.array(z.string().min(1)).min(2).max(4),
			}),
		)
		.min(1)
		.max(4),
});

export function codexAsyncQuestionOperation({
	toolName,
	toolInput,
}: NativeToolCall): ToolOperation[] {
	if (toolName !== "request_user_input_async") return [];
	const input = inputSchema.safeParse(toolInput);
	if (!input.success) return [];
	return [
		{
			kind: "question",
			tool: toolName,
			questionsJson: JSON.stringify({
				questions: input.data.questions.map(({ title, options }) => ({
					question: title,
					header: "Question",
					multiSelect: false,
					options: options.map((label) => ({ label, description: "" })),
				})),
			}),
		},
	];
}
