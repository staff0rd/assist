import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { removeStagedAttachments } from "../../shared/removeStagedAttachments";
import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { minGhAttachVersion } from "./minGhAttachVersion";

const PLACED_URL = /https:\/\/\S+\/(pull|issues)\/\d+/;

type GhFailure = { stdout?: string; stderr?: string };

function reportPartialFailure(
	attachments: PreviewAttachment[],
	stderr: string,
): void {
	const failed = attachments.filter(
		({ path }) => stderr.includes(path) || stderr.includes(basename(path)),
	);
	const named = failed.length > 0 ? failed : attachments;
	console.error(
		`Some attachments failed to upload: ${named.map((a) => a.path).join(", ")}. The body still references their local paths, so re-attach them with gh's --attach flag; the staged files were kept.`,
	);
}

export function runGhWithAttachments(
	args: string[],
	attachments: PreviewAttachment[],
): string {
	const attaching = attachments.length > 0;
	try {
		const stdout = execFileSync("gh", args, {
			encoding: "utf8",
			stdio: ["inherit", "pipe", attaching ? "pipe" : "inherit"],
		});
		removeStagedAttachments(attachments);
		return stdout;
	} catch (error) {
		const { stdout = "", stderr = "" } = error as GhFailure;
		if (stderr) process.stderr.write(stderr);

		if (/unknown flag:? --attach/.test(stderr)) {
			console.error(
				`Your gh does not support --attach. Upgrade the GitHub CLI to ${minGhAttachVersion} or later.`,
			);
			process.exit(1);
		}

		if (attaching && PLACED_URL.test(stdout)) {
			reportPartialFailure(attachments, stderr);
			return stdout;
		}

		process.exit(1);
	}
}
