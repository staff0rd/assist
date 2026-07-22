import { execFileSync } from "node:child_process";
import {
	buildCreateArgs,
	buildEditArgs,
	type CreateOptions,
} from "./buildCreateArgs";
import { recordPrActivity } from "./recordPrActivity";

function hasUpstream(): boolean {
	try {
		execFileSync(
			"git",
			["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
			{ stdio: "pipe" },
		);
		return true;
	} catch {
		return false;
	}
}

function ensureBranchPushed(): void {
	const args = hasUpstream()
		? ["push"]
		: ["push", "--set-upstream", "origin", "HEAD"];
	execFileSync("git", args, { stdio: "inherit" });
}

export async function placePr(
	prNumber: number | null,
	title: string,
	body: string,
	options: CreateOptions,
): Promise<void> {
	const args =
		prNumber !== null
			? buildEditArgs(prNumber, title, body)
			: buildCreateArgs(title, body, options);

	try {
		if (prNumber === null && !options.head) ensureBranchPushed();
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}

	await recordPrActivity();
}
