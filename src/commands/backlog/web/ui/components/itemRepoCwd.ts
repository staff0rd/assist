function sameOrigin(a: string | undefined, b: string): boolean {
	return a?.toLowerCase() === b.toLowerCase();
}

export function itemRepoCwd(
	origin: string | undefined,
	selectedCwd: string | undefined,
	repos: string[],
	originOf: (cwd: string) => string | undefined,
): string | undefined {
	if (!origin) return selectedCwd;
	if (selectedCwd && sameOrigin(originOf(selectedCwd), origin))
		return selectedCwd;
	return repos.find((repo) => sameOrigin(originOf(repo), origin));
}
