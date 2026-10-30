type ScopeOptions = {
	global?: boolean;
	repo?: boolean | string;
	user?: boolean;
};

export function scopeOptionsError(
	options: ScopeOptions,
	repoAction: "writes to" | "removes from",
): string | undefined {
	if (options.user && (options.global || options.repo !== undefined))
		return "--user writes user (db); drop -g and --repo";
	if (options.repo !== undefined && !options.global)
		return `--repo ${repoAction} the global config; add -g (e.g. -g --repo)`;
	return undefined;
}
