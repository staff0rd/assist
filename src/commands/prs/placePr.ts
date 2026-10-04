import { execFileSync } from "node:child_process";
import { buildCreateArgs, type CreateOptions } from "./buildCreateArgs";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { recordPrActivity } from "./recordPrActivity";
import { runGhWithAttachments } from "./runGhWithAttachments";
import { buildEditArgs } from "./buildEditArgs";

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
	attachments: PreviewAttachment[] = [],
): Promise<void> {
	const args =
		prNumber !== null
			? buildEditArgs(prNumber, title, body, attachments)
			: buildCreateArgs(title, body, options, attachments);

	try {
		if (prNumber === null && !options.head) ensureBranchPushed();
	} catch {
		process.exit(1);
	}
	process.stdout.write(runGhWithAttachments(args, attachments));

	await recordPrActivity();
}
