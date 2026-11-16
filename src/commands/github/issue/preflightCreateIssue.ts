import {
	type CreateIssueMetadata,
	resolveCreateIssueMetadata,
} from "./resolveCreateIssueMetadata";

export function preflightCreateIssue(
	options: Parameters<typeof resolveCreateIssueMetadata>[0],
): CreateIssueMetadata | undefined {
	try {
		return resolveCreateIssueMetadata(options);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
