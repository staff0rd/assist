import { spawnSync } from "node:child_process";
import { tryGit } from "../../shared/tryGit";
import { PushFailedError } from "./PushFailedError";
import {
	type PushTarget,
	pushTargetForRenamedUpstream,
} from "./pushTargetForRenamedUpstream";

const MAX_PUSH_ATTEMPTS = 3;
const UPSTREAM_MOVED = /\[rejected\].*\((fetch first|non-fast-forward)\)/;

export function pushCommit(trunkMode: boolean): void {
	const target = pushTargetForRenamedUpstream(trunkMode);
	for (let attempt = 1; ; attempt++) {
		const stderr = runPush(target);
		if (stderr === null) return;
		if (!UPSTREAM_MOVED.test(stderr)) {
			throw new PushFailedError(firstGitError(stderr));
		}
		if (attempt === MAX_PUSH_ATTEMPTS) {
			throw new PushFailedError(
				`push was still rejected after ${MAX_PUSH_ATTEMPTS} attempts because the upstream kept moving`,
			);
		}
		rebaseOntoUpstream(target);
	}
}

function pushArgs(target: PushTarget | null): string[] {
	if (!target) return ["push"];
	return [
		"push",
		...(target.setUpstream ? ["--set-upstream"] : []),
		target.remote,
		`HEAD:${target.branch}`,
	];
}

function runPush(target: PushTarget | null): string | null {
	const result = spawnSync("git", pushArgs(target), {
		encoding: "utf8",
		stdio: ["inherit", "inherit", "pipe"],
	});
	const stderr = result.stderr ?? "";
	process.stderr.write(stderr);
	if (result.status === 0) return null;
	return stderr || (result.error?.message ?? "git push failed");
}

function rebaseOntoUpstream(target: PushTarget | null): void {
	const source = target ? [target.remote, target.branch] : [];
	console.log(
		"Push rejected because the upstream moved; rebasing and retrying",
	);
	const result = spawnSync(
		"git",
		["pull", "--rebase", "--autostash", ...source],
		{ stdio: "inherit" },
	);
	if (result.status === 0) return;
	tryGit("rebase", "--abort");
	throw new PushFailedError(
		`rebasing onto ${source.join("/") || "the upstream"} failed`,
	);
}

function firstGitError(stderr: string): string {
	const lines = stderr.split("\n").map((line) => line.trim());
	return (
		lines.find((line) => /^(error|fatal):/.test(line)) ??
		lines.find(Boolean) ??
		"git push failed"
	);
}
