import { loadConfig } from "../../shared/loadConfig";
import type { CreateOptions } from "./buildCreateArgs";
import { appendScreenshots } from "./appendScreenshots";
import { buildValidatedBody } from "./buildValidatedBody";
import { parseScreenshotSpecs } from "./parseScreenshotSpecs";
import { placePr } from "./placePr";
import { previewAndPlace } from "./previewAndPlace";
import type { BaseRepoMode } from "./resolveBaseRepo";
import { type DraftOptionSource, resolveDraftState } from "./resolveDraftState";
import { resolveRaiseTarget } from "./resolveRaiseTarget";
import { findOpenPrNumber } from "./findOpenPrNumber";

type RaiseOptions = Omit<CreateOptions, "body"> & {
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
	force?: boolean;
	screenshot?: string[];
	baseRepo?: Exclude<BaseRepoMode, "auto">;
};

const USAGE =
	"Usage: assist prs raise --title <title> --what <what> --why <why> [--how <how>] [--resolves <key>] [--screenshot '[Group/]Caption=path'] [--base-repo <origin|parent>] [--force]";

export async function raise(
	options: RaiseOptions,
	command?: DraftOptionSource,
): Promise<void> {
	const screenshots = parseScreenshotSpecs(options.screenshot);
	const { title, body } = buildValidatedBody(options, USAGE);
	const resolved = {
		...options,
		...resolveRaiseTarget(options.baseRepo),
		draft: resolveDraftState(options, command),
	};
	const existing = findOpenPrNumber(options.baseRepo);
	const sessionId = process.env.ASSIST_SESSION_ID;

	if (process.env.ASSIST_SESSION === "1" && sessionId) {
		await previewAndPlace({
			sessionId,
			title,
			body,
			prNumber: existing,
			options: resolved,
			reviewAfter: loadConfig().prs?.reviewAfterRaise ?? true,
			screenshots,
		});
		return;
	}

	if (existing !== null && !options.force) {
		console.error(
			`Error: A pull request already exists for this branch (#${existing}). Pass --force to overwrite it, or use 'assist prs edit' to update individual sections.`,
		);
		process.exit(1);
	}

	await placePr(
		existing,
		title,
		appendScreenshots(body, screenshots),
		resolved,
		screenshots,
	);
}
