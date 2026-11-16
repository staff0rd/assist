import { loadConfig } from "../../../shared/loadConfig";
import { tryGit } from "../../../shared/tryGit";

function configuredDefaultBranch(): string | undefined {
	try {
		return loadConfig().branch?.defaultBranch;
	} catch {
		return undefined;
	}
}

function originHeadBranch(): string | undefined {
	const head = tryGit(
		"symbolic-ref",
		"--quiet",
		"--short",
		"refs/remotes/origin/HEAD",
	);
	return head?.startsWith("origin/") ? head.slice("origin/".length) : undefined;
}

export function remoteDefaultRef(): string | null {
	const branches = [
		configuredDefaultBranch(),
		originHeadBranch(),
		"main",
		"master",
	].filter((branch): branch is string => Boolean(branch));
	for (const branch of new Set(branches)) {
		const ref = `origin/${branch}`;
		if (tryGit("rev-parse", "--verify", "--quiet", `${ref}^{commit}`) !== null)
			return ref;
	}
	return null;
}
