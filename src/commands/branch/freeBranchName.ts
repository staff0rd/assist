import { execFileSync } from "node:child_process";

export function freeBranchName(name: string): string {
	let candidate = name;
	for (let suffix = 2; branchTaken(candidate); suffix++) {
		candidate = `${name}-${suffix}`;
	}
	return candidate;
}

function branchTaken(name: string): boolean {
	return (
		refExists(`refs/heads/${name}`) || refExists(`refs/remotes/origin/${name}`)
	);
}

function refExists(ref: string): boolean {
	try {
		execFileSync("git", ["show-ref", "--verify", "--quiet", ref], {
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}
