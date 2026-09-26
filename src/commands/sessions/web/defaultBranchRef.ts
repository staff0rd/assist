import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";

const ORIGIN_HEAD_REF = "refs/remotes/origin/HEAD";
const ORIGIN_REF_PREFIX = "refs/remotes/origin/";
const FALLBACK_BRANCHES = ["main", "master"];

function configuredDefaultBranch(cwd: string): string | undefined {
	try {
		return loadConfigFrom(cwd).branch?.defaultBranch;
	} catch {
		return undefined;
	}
}

async function originHeadBranch(cwd: string): Promise<string | undefined> {
	try {
		const ref = (
			await execGit(cwd, ["symbolic-ref", "--quiet", ORIGIN_HEAD_REF])
		).trim();
		if (!ref.startsWith(ORIGIN_REF_PREFIX)) return undefined;
		return ref.slice(ORIGIN_REF_PREFIX.length) || undefined;
	} catch {
		return undefined;
	}
}

async function candidateBranches(cwd: string): Promise<string[]> {
	const configured = configuredDefaultBranch(cwd);
	const originHead = configured ? undefined : await originHeadBranch(cwd);
	const candidates = [configured, originHead, ...FALLBACK_BRANCHES].filter(
		(branch): branch is string => Boolean(branch),
	);
	return [...new Set(candidates)];
}

async function refExists(cwd: string, ref: string): Promise<boolean> {
	try {
		await execGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
		return true;
	} catch {
		return false;
	}
}

export async function defaultBranchRef(
	cwd: string,
): Promise<string | undefined> {
	for (const branch of await candidateBranches(cwd)) {
		const ref = `origin/${branch}`;
		if (await refExists(cwd, ref)) return ref;
	}
	return undefined;
}
