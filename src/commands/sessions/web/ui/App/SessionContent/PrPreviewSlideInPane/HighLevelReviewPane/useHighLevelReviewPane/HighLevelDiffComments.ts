import type { DiffComment } from "../../../../formatDiffComment";

export type HighLevelDiffComments = {
	cwd?: string | undefined;
	onComment?: ((comment: DiffComment) => void) | undefined;
	unavailable?: string | undefined;
};
