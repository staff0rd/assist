import { existsSync } from "node:fs";
import { type GitResult, gitResult, gitSyncResult } from "./git";
import { holdsNoCheckout } from "./holdsNoCheckout";

type TreeState = {
	dirty: boolean;
	localOnlyCommits: boolean;
};

export type Durability =
	| { durable: true; gone?: boolean }
	| { durable: false; reason: string };

const treeIsGone: Durability = { durable: true, gone: true };

export function treeDurability(state: TreeState): Durability {
	if (state.dirty) return { durable: false, reason: "uncommitted changes" };
	if (state.localOnlyCommits)
		return { durable: false, reason: "unpushed commits" };
	return { durable: true };
}

function* durabilityProbes(
	cwd: string,
): Generator<string[], Durability, GitResult> {
	const status = yield ["status", "--porcelain"];
	if (!status.ok && notACheckout(cwd, status.error)) return treeIsGone;
	if (!status.ok)
		return { durable: false, reason: `tree state unreadable: ${status.error}` };
	const dirty = status.out !== "";
	const upstream = yield [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}",
	];
	if (upstream.ok && upstream.out) {
		const ahead = yield ["rev-list", "--count", "@{upstream}..HEAD"];
		if (ahead.ok && Number(ahead.out) === 0)
			return treeDurability({ dirty, localOnlyCommits: false });
	}
	const remoteBranches = yield ["branch", "-r", "--contains", "HEAD"];
	return treeDurability({
		dirty,
		localOnlyCommits: !remoteBranches.ok || remoteBranches.out === "",
	});
}

function notACheckout(cwd: string, error: string): boolean {
	return holdsNoCheckout(cwd) && /not a git repository/i.test(error);
}

export async function checkDurability(cwd: string): Promise<Durability> {
	if (!existsSync(cwd)) return treeIsGone;
	const probes = durabilityProbes(cwd);
	let step = probes.next();
	while (!step.done) step = probes.next(await gitResult(cwd, step.value));
	return step.value;
}

export function checkDurabilitySync(cwd: string): Durability {
	if (!existsSync(cwd)) return treeIsGone;
	const probes = durabilityProbes(cwd);
	let step = probes.next();
	while (!step.done) step = probes.next(gitSyncResult(cwd, step.value));
	return step.value;
}
