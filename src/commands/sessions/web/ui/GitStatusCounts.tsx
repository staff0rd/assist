import { GitStatusLink, GROUPS } from "./GitStatusLink";
import { useGitStatusCounts } from "./useGitStatusCounts";

export function GitStatusCounts({ cwd }: { cwd: string }) {
	const counts = useGitStatusCounts(cwd);

	const groups = counts
		? GROUPS.map((g) => ({
				...g,
				count: counts[g.key].length,
				paths: counts[g.key],
			})).filter((g) => g.count > 0)
		: [];
	if (!counts || groups.length === 0) return null;

	return <GitStatusLink groups={groups} />;
}
