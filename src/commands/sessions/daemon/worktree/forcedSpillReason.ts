export function forcedSpillReason(
	clone: string,
	trunk: boolean,
	options: {
		replacesTree?: string;
		commits?: boolean;
		backlogRun?: boolean;
		assistCommand?: string;
	},
): string | undefined {
	if (options.replacesTree)
		return `resumed session spilled out of the clone ${clone}: its worktree ${options.replacesTree} is gone`;
	if (options.backlogRun === true)
		return `backlog run spilled out of the clone ${clone}: backlog runs never use the clone`;
	if (trunk === true && options.commits === true)
		return `committing session spilled out of the clone ${clone}: worktree.trunk is on, so a commit here would land on the local mainline`;
	if (options.assistCommand !== undefined)
		return `assist ${options.assistCommand} session spilled out of the clone ${clone}: only prompt sessions use the clone`;
	return undefined;
}
