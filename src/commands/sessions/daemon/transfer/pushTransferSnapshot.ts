import { basename } from "node:path";
import { git, gitOrNull } from "../worktree/git";
import { type TransferSnapshot, transferRefFor } from "./TransferSnapshot";

const PUSH_TIMEOUT_MS = 120_000;
const WIP_COMMIT = [
	"-c",
	"user.name=assist",
	"-c",
	"user.email=assist@localhost",
	"-c",
	"commit.gpgsign=false",
	"commit",
	"--no-verify",
	"--allow-empty",
	"--quiet",
	"-m",
	"assist transfer WIP",
];

async function currentBranch(
	path: string,
	treeRoot: string | undefined,
): Promise<string | undefined> {
	const branch = await gitOrNull(path, ["symbolic-ref", "--short", "HEAD"]);
	if (!branch || (treeRoot && branch === basename(treeRoot))) return undefined;
	return branch;
}

async function upstreamBranch(path: string): Promise<string | undefined> {
	const upstream = await gitOrNull(path, [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{u}",
	]);
	if (!upstream?.startsWith("origin/")) return undefined;
	return upstream.slice("origin/".length);
}

export async function pushTransferSnapshot(
	path: string,
	itemId: string,
	treeRoot?: string,
): Promise<TransferSnapshot> {
	const ref = transferRefFor(itemId);
	const branch = await currentBranch(path, treeRoot);
	const upstream = await upstreamBranch(path);
	const head = (await git(path, ["rev-parse", "HEAD"])).trim();
	await git(path, ["add", "-A"]);
	try {
		await git(path, WIP_COMMIT);
		await git(
			path,
			["push", "--no-verify", "--force", "origin", `HEAD:refs/heads/${ref}`],
			PUSH_TIMEOUT_MS,
		);
	} finally {
		await git(path, ["reset", "--mixed", "--quiet", head]);
	}
	return { ref, branch, upstream };
}
