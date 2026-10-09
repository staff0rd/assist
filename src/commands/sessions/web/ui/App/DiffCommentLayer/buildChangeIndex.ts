import { type ChangeData, getChangeKey, type HunkData } from "react-diff-view";

export type DiffChangeIndex = {
	changes: ChangeData[];
	positionByKey: Map<string, number>;
};

export function buildChangeIndex(hunks: readonly HunkData[]): DiffChangeIndex {
	const changes = hunks.flatMap((hunk) => hunk.changes);
	return {
		changes,
		positionByKey: new Map(
			changes.map((change, position) => [getChangeKey(change), position]),
		),
	};
}
