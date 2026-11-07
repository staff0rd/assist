import { backlogRefError, findBacklogRefs } from "./findBacklogRefs";
import { rejectHarnessAttribution } from "./rejectHarnessAttribution";

type ContentLabels = {
	subject: string;
	context: string;
};

export function validateProposedContent(
	labels: ContentLabels,
	title: string,
	body: string,
): void {
	const { subject, context } = labels;

	if (title.toLowerCase().includes("claude")) {
		console.error(`Error: ${subject} title must not reference Claude`);
		process.exit(1);
	}

	if (body.toLowerCase().includes("claude")) {
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
