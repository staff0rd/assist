import { execFileSync } from "node:child_process";

type Repo = { org: string; repo: string };

type ForkParent = Repo | "not-a-fork" | "lookup-failed";

const CACHE_KEY = "assist.forkParent";
const NOT_A_FORK = "not-a-fork";

function slug({ org, repo }: Repo): string {
	return `${org}/${repo}`;
}

type Run = (file: string, args: string[]) => string;

function runIn(cwd: string | undefined): Run {
	return (file, args) =>
		execFileSync(file, args, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
			windowsHide: true,
			timeout: 15_000,
			cwd,
		}).trim();
}

function parseCachedParent(value: string | undefined): ForkParent | null {
	if (value === NOT_A_FORK) return NOT_A_FORK;
	const [org, repo] = (value ?? "").split("/");
	return org && repo ? { org, repo } : null;
}

function readCached(origin: Repo, run: Run): ForkParent | null {
	try {
		const cached = run("git", ["config", "--local", "--get", CACHE_KEY]);
		const [cachedOrigin, cachedParent] = cached.split(" ");
		if (cachedOrigin?.toLowerCase() !== slug(origin).toLowerCase()) return null;
		return parseCachedParent(cachedParent);
	} catch {
		return null;
	}
}

function writeCached(
	origin: Repo,
	parent: Repo | typeof NOT_A_FORK,
	run: Run,
): void {
	const cached = parent === NOT_A_FORK ? NOT_A_FORK : slug(parent);
	try {
		run("git", ["config", "--local", CACHE_KEY, `${slug(origin)} ${cached}`]);
	} catch {
		return;
	}
}

function lookUp(origin: Repo, run: Run): ForkParent {
	try {
		const { parent } = JSON.parse(
			run("gh", ["repo", "view", slug(origin), "--json", "parent"]),
		);
		if (!parent) return NOT_A_FORK;
		return { org: parent.owner.login, repo: parent.name };
	} catch {
		return "lookup-failed";
	}
}

export function findForkParent(origin: Repo, cwd?: string): ForkParent {
	const run = runIn(cwd);
	const cached = readCached(origin, run);
	if (cached) return cached;
	const parent = lookUp(origin, run);
	if (parent !== "lookup-failed") writeCached(origin, parent, run);
	return parent;
}
