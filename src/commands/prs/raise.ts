import type { CreateOptions } from "./buildCreateArgs";
import { buildValidatedBody } from "./buildValidatedBody";
import { placePr } from "./placePr";
import { previewAndPlace } from "./previewAndPlace";
import { findCurrentPrNumber } from "./shared";

type RaiseOptions = Omit<CreateOptions, "body"> & {
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
	force?: boolean;
};

const USAGE =
	"Usage: assist prs raise --title <title> --what <what> --why <why> [--how <how>] [--resolves <key>] [--force]";

export async function raise(options: RaiseOptions): Promise<void> {
	const { title, body } = buildValidatedBody(options, USAGE);
	const existing = findCurrentPrNumber();
	const sessionId = process.env.ASSIST_SESSION_ID;

	if (process.env.ASSIST_SESSION === "1" && sessionId) {
		await previewAndPlace({
			sessionId,
			title,
			body,
			prNumber: existing,
			options,
		});
		return;
	}

	if (existing !== null && !options.force) {
		console.error(
			`Error: A pull request already exists for this branch (#${existing}). Pass --force to overwrite it, or use 'assist prs edit' to update individual sections.`,
		);
		process.exit(1);
	}

	await placePr(existing, title, body, options);
}
