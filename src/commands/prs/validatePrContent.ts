import { backlogRefError, findBacklogRefs } from "../../shared/findBacklogRefs";
import { findWallOfText } from "./findWallOfText";

export function validatePrContent(title: string, body: string): void {
	if (title.toLowerCase().includes("claude")) {
		console.error("Error: PR title must not reference Claude");
		process.exit(1);
	}

	if (body.toLowerCase().includes("claude")) {
		console.error("Error: PR body must not reference Claude");
		process.exit(1);
	}

	const titleBacklogIds = findBacklogRefs(title);
	if (titleBacklogIds.length > 0) {
		console.error(backlogRefError("PR title", "PRs", titleBacklogIds));
		process.exit(1);
	}

	const bodyBacklogIds = findBacklogRefs(body);
	if (bodyBacklogIds.length > 0) {
		console.error(backlogRefError("PR body", "PRs", bodyBacklogIds));
		process.exit(1);
	}

	const wall = findWallOfText(body);
	if (wall) {
		console.error(
			`Error: the "${wall.section}" section contains a wall-of-text paragraph (${wall.chars} chars). Be concise — split it into bullet points or trim it.`,
		);
		process.exit(1);
	}
}
