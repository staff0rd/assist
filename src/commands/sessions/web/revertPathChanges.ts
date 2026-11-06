import { execGit } from "./execGit";

function git(cwd: string, args: string[]): Promise<string> {
	return execGit(cwd, ["--literal-pathspecs", ...args]);
}

async function isTracked(cwd: string, path: string): Promise<boolean> {
	try {
		await git(cwd, ["ls-files", "--error-unmatch", "--", path]);
		return true;
	} catch {
		return false;
	}
}

async function isInHead(cwd: string, path: string): Promise<boolean> {
	const listing = await git(cwd, ["ls-tree", "HEAD", "--", path]);
	return listing.trim().length > 0;
}

async function hasChanges(cwd: string, path: string): Promise<boolean> {
	const status = await git(cwd, [
		"status",
		"--porcelain",
		"-z",
		"--untracked-files=all",
		"--",
		path,
	]);
	return status.length > 0;
}

async function renameSources(cwd: string, path: string): Promise<string[]> {
	const fields = (
		await git(cwd, ["diff", "HEAD", "--name-status", "-z"])
	).split("\0");
	const sources: string[] = [];
	for (let i = 0; i < fields.length;) {
		const status = fields[i];
		if (status.startsWith("R")) {
			if (fields[i + 2] === path) sources.push(fields[i + 1]);
			i += 3;
		} else {
			i += status.startsWith("C") ? 3 : 2;
		}
	}
	return sources;
}

async function restorePath(cwd: string, path: string): Promise<void> {
	if (await isInHead(cwd, path)) {
		await git(cwd, ["checkout", "HEAD", "--", path]);
		return;
	}
	if (await isTracked(cwd, path)) {
		await git(cwd, ["rm", "-f", "--", path]);
		return;
	}
	await git(cwd, ["clean", "-f", "--", path]);
}

export async function revertPathChanges(
	cwd: string,
	path: string,
): Promise<void> {
	if (!(await hasChanges(cwd, path)))
		throw new Error(`No uncommitted changes found for ${path}`);
	for (const target of [...(await renameSources(cwd, path)), path])
		await restorePath(cwd, target);
	if (await hasChanges(cwd, path))
		throw new Error(`${path} still has uncommitted changes`);
}
