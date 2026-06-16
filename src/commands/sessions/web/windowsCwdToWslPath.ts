// why: a Windows repo cwd like C:\git\app is reachable from the WSL filesystem
// via the /mnt mount (/mnt/c/git/app). Use ONLY for cheap reads (e.g. resolving
// the git remote) — never a full `git status`, which walks the tree and is
// unusably slow over the 9p mount.
export function windowsCwdToWslPath(cwd: string): string {
	const match = /^([A-Za-z]):[\\/](.*)$/.exec(cwd);
	if (!match) return cwd;
	const drive = match[1].toLowerCase();
	const rest = match[2].replace(/\\/g, "/");
	return `/mnt/${drive}/${rest}`;
}
