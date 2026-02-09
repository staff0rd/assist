import chalk from "chalk";

const FULL_TRANSCRIPT_REGEX = /^\[Full Transcript\]\(([^)]+)\)/;

export function validateStagedContent(
	filename: string,
	content: string,
): { contentAfterLink: string } {
	const firstLine = content.split("\n")[0];

	const match = firstLine.match(FULL_TRANSCRIPT_REGEX);
	if (!match) {
		console.error(
			chalk.red(
				`Staged file ${filename} missing [Full Transcript](<path>) link on first line.`,
			),
		);
		process.exit(1);
	}

	const contentAfterLink = content.slice(firstLine.length).trim();
	if (!contentAfterLink) {
		console.error(
			chalk.red(
				`Staged file ${filename} has no summary content after the transcript link.`,
			),
		);
		process.exit(1);
	}

	return { contentAfterLink };
}
