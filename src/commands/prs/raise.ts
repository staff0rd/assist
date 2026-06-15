import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";
import { buildCreateArgs, type CreateOptions } from "./buildCreateArgs";
import { buildPrBody } from "./buildPrBody";
import { findCurrentPrNumber } from "./shared";
import { validatePrContent } from "./validatePrContent";

type RaiseOptions = Omit<CreateOptions, "body"> & {
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
	force?: boolean;
};

export function raise(options: RaiseOptions): void {
	if (!options.title || !options.what || !options.why) {
		console.error(
			"Usage: assist prs raise --title <title> --what <what> --why <why> [--how <how>] [--resolves <key>] [--force]",
		);
		process.exit(1);
	}

	const body = buildPrBody({
		what: options.what,
		why: options.why,
		how: options.how,
		resolves: options.resolves,
	});

	validatePrContent(options.title, body);

	const existing = findCurrentPrNumber();

	if (existing !== null && !options.force) {
		console.error(
			`Error: A pull request already exists for this branch (#${existing}). Pass --force to overwrite it, or use 'assist prs edit' to update individual sections.`,
		);
		process.exit(1);
	}

	const args =
		existing !== null
			? [
					`gh pr edit ${existing}`,
					`--title ${shellQuote(options.title)}`,
					`--body ${shellQuote(body)}`,
				]
			: buildCreateArgs(options.title, body, options);

	try {
		execSync(args.join(" "), { stdio: "inherit" });
	} catch (_error) {
		process.exit(1);
	}
}
