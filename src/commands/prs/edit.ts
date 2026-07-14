import { execFileSync } from "node:child_process";
import { editPrBody } from "./editPrBody";
import { getCurrentPr } from "./shared";
import { validatePrContent } from "./validatePrContent";

type EditOptions = {
	title?: string;
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
};

export function edit(options: EditOptions): void {
	const hasResolves = (options.resolves?.length ?? 0) > 0;
	const hasSection =
		options.what !== undefined ||
		options.why !== undefined ||
		options.how !== undefined ||
		hasResolves;

	if (!options.title && !hasSection) {
		console.error(
			"Usage: assist prs edit [--title <title>] [--what <what>] [--why <why>] [--how <how>] [--resolves <key>]",
		);
		process.exit(1);
	}

	const { number, body } = getCurrentPr();
	const newBody = editPrBody(body, options);
	validatePrContent(options.title ?? "", newBody);

	const args = ["pr", "edit", String(number)];
	if (options.title) args.push("--title", options.title);
	args.push("--body", newBody);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}
}
