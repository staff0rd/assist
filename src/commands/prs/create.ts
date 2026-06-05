import { execSync } from "node:child_process";
import { buildCreateArgs, type CreateOptions } from "./buildCreateArgs";
import { validatePrContent } from "./validatePrContent";

export function create(options: CreateOptions): void {
	if (!options.title || !options.body) {
		console.error(
			"Usage: assist prs create --title <title> --body <body> [--base <branch>] [--head <branch>] [--draft] [--web] [--label <label>] [--assignee <login>] [--reviewer <handle>] [--milestone <name>]",
		);
		process.exit(1);
	}

	validatePrContent(options.title, options.body);

	const args = buildCreateArgs(options.title, options.body, options);

	try {
		execSync(args.join(" "), { stdio: "inherit" });
	} catch (_error) {
		process.exit(1);
	}
}
