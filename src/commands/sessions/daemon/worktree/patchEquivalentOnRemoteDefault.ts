import type { GitResult } from "./git";

export function* patchEquivalentOnRemoteDefault(): Generator<
	string[],
	boolean,
	GitResult
> {
	const head = yield ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"];
	const remoteDefault = head.ok && head.out ? head.out : "origin/main";
	const unmatched = yield [
		"log",
		"--cherry-pick",
		"--right-only",
		"--no-merges",
		"--format=%H",
		`${remoteDefault}...HEAD`,
	];
	return unmatched.ok && unmatched.out === "";
}
