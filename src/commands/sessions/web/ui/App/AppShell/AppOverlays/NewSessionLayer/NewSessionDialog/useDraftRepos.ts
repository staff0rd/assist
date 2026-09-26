import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";

export function useDraftRepos(node: string | undefined, cwd: string) {
	const { repos, reposByNode } = useRepoSelectionContext();
	const { nodes } = useNodeSelectionContext();
	const local = !node || node === nodes?.local;
	const nodeRepos = local ? repos : (reposByNode?.[node] ?? []);
	return {
		repos: nodeRepos,
		cwd: local || nodeRepos.includes(cwd) ? cwd : "",
	};
}
