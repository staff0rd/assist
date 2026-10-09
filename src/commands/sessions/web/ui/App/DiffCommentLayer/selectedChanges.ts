import { type ChangeData, getChangeKey } from "react-diff-view";

export type SelectedChange = { key: string; content: string };

export function selectedChanges(changes: ChangeData[]): SelectedChange[] {
	return changes.map((change) => ({
		key: getChangeKey(change),
		content: change.content,
	}));
}
