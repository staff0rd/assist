import { asRecord } from "./asRecord";
import { unfinishedBackgroundTasks } from "./unfinishedBackgroundTasks";

const ASK_QUESTION_COMMAND = /\bassist ask-question\b/;

export function pendingAskQuestionTasks(
	entries: Record<string, unknown>[],
): string[] {
	const askQuestionToolUses = new Set<string>();
	const askQuestionTasks = new Set<string>();
	for (const entry of entries) {
		for (const block of contentBlocks(entry)) {
			const input = asRecord(block.input);
			if (
				block.type === "tool_use" &&
				typeof block.id === "string" &&
				typeof input?.command === "string" &&
				ASK_QUESTION_COMMAND.test(input.command)
			)
				askQuestionToolUses.add(block.id);
			if (
				block.type === "tool_result" &&
				askQuestionToolUses.has(block.tool_use_id as string)
			) {
				const taskId = asRecord(entry.toolUseResult)?.backgroundTaskId;
				if (typeof taskId === "string") askQuestionTasks.add(taskId);
			}
		}
	}
	return unfinishedBackgroundTasks(entries).filter((id) =>
		askQuestionTasks.has(id),
	);
}

function contentBlocks(
	entry: Record<string, unknown>,
): Record<string, unknown>[] {
	const content = asRecord(entry.message)?.content;
	if (!Array.isArray(content)) return [];
	return content
		.map(asRecord)
		.filter((block): block is Record<string, unknown> => block !== null);
}
