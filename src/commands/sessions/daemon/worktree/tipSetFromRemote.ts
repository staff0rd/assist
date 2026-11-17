const fetched = /^(fetch|clone)\b|^pull\b.*: Fast-forward$/;
const fromRef =
	/^branch: (?:Created from|Reset to) (\S+)$|^merge (\S+): Fast-forward$/;

function isRemoteRef(ref: string, remotes: string[]): boolean {
	const name = ref.replace(/^refs\/remotes\//, "");
	return remotes.some((remote) => name.startsWith(`${remote}/`));
}

// A branch reflog subject that moved the tip to something taken from a remote.
// "Created from" / "Reset to" / merge fast-forwards only count when their
// source is a remote-tracking ref: `checkout -b x` from a local branch would
// otherwise hide that branch's unpushed commits.
export function tipSetFromRemote(subject: string, remotes: string[]): boolean {
	if (fetched.test(subject)) return true;
	const match = fromRef.exec(subject);
	const ref = match?.[1] ?? match?.[2];
	return !!ref && isRemoteRef(ref, remotes);
}
