import { backlogRefError, findBacklogRefs } from "./findBacklogRefs";
import { rejectHarnessAttribution } from "./rejectHarnessAttribution";

type ContentLabels = {
	subject: string;
	context: string;
};

const URL_PATTERN = /https?:\/\/[^\s<>()[\]"'`]+/gi;

function mentionsClaude(text: string): boolean {
	return text.replace(URL_PATTERN, "").toLowerCase().includes("claude");
}

export function validateProposedContent(
	labels: ContentLabels,
	title: string,
	body: string,
): void {
	const { subject, context } = labels;

	if (mentionsClaude(title)) {
		console.error(`Error: ${subject} title must not reference Claude`);
		process.exit(1);
	}

	if (mentionsClaude(body)) {
		console.error(`Error: ${subject} body must not reference Claude`);
		process.exit(1);
	}
	rejectHarnessAttribution(`${subject} title`, title);
	rejectHarnessAttribution(`${subject} body`, body);

	const titleBacklogIds = findBacklogRefs(title);
	if (titleBacklogIds.length > 0) {
		console.error(
			backlogRefError(`${subject} title`, context, titleBacklogIds),
		);
		process.exit(1);
	}

	const bodyBacklogIds = findBacklogRefs(body);
	if (bodyBacklogIds.length > 0) {
		console.error(backlogRefError(`${subject} body`, context, bodyBacklogIds));
		process.exit(1);
	}
}
