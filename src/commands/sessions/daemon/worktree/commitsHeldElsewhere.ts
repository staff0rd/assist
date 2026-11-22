import type { GitResult } from "./git";
import { patchEquivalentOnRemoteDefault } from "./patchEquivalentOnRemoteDefault";
import { tipOnRemote } from "./tipOnRemote";

export function* commitsHeldElsewhere(
	itemTreeHead?: string,
): Generator<string[], boolean, GitResult> {
	if (itemTreeHead) {
		const landed = yield ["merge-base", "--is-ancestor", "HEAD", itemTreeHead];
		if (landed.ok) return true;
	}
	const upstream = yield [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}",
	];
	if (upstream.ok && upstream.out) {
		const ahead = yield ["rev-list", "--count", "@{upstream}..HEAD"];
		if (ahead.ok && Number(ahead.out) === 0) return true;
	}
	if (yield* tipOnRemote()) return true;
	return yield* patchEquivalentOnRemoteDefault();
}
