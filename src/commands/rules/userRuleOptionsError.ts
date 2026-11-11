export type UserRuleOptions = {
	scope?: string;
	title?: string;
	user?: boolean;
	node?: boolean;
	repo?: boolean | string;
};

export function userRuleOptionsError(
	options: UserRuleOptions,
): string | undefined {
	const targets = [
		options.user && "--user",
		options.node && "--node",
		options.repo !== undefined && "--repo",
	].filter(Boolean);
	if (targets.length > 1)
		return `${targets.join(", ")} each write advice.rules in a different scope (user (db), user (node), repo (db)); pass one`;
	if (options.scope !== undefined)
		return `${targets[0]} writes advice.rules, not a CLAUDE.md, and cannot be combined with --scope`;
	return undefined;
}
