export type ScopeOptions = {
	node?: boolean;
	repo?: boolean | string;
	user?: boolean;
};

export function scopeOptionsError(options: ScopeOptions): string | undefined {
	const chosen = [
		options.repo !== undefined && "--repo",
		options.node && "--node",
		options.user && "--user",
	].filter(Boolean);
	if (chosen.length > 1)
		return `${chosen.join(" and ")} pick different scopes; pass one: --repo for repo (db), --node for user (node), --user for user (db)`;
	return undefined;
}
