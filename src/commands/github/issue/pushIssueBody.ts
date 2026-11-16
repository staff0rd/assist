import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { attachArgs } from "../../prs/attachArgs";
import { runGhWithAttachments } from "../../prs/runGhWithAttachments";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { mergeIssueScreenshots } from "./mergeIssueScreenshots";

export function pushIssueBody(
	number: number,
	repo: string | undefined,
	bodyPath: string,
	attachments: PreviewAttachment[] = [],
	title?: string,
): void {
	const repoArgs = [
		...(title === undefined ? [] : ["--title", title]),
		...(repo ? ["--repo", repo] : []),
	];
	if (attachments.length > 0) {
		const body = mergeIssueScreenshots(
			readFileSync(bodyPath, "utf8"),
			attachments,
		);
		process.stdout.write(
			runGhWithAttachments(
				[
					"issue",
					"edit",
					String(number),
					"--body",
					body,
					...repoArgs,
					...attachArgs(attachments),
				],
				attachments,
			),
		);
		return;
	}

	try {
		execFileSync(
			"gh",
			["issue", "edit", String(number), "--body-file", bodyPath, ...repoArgs],
			{ stdio: "inherit" },
		);
	} catch {
		process.exit(1);
	}
}
