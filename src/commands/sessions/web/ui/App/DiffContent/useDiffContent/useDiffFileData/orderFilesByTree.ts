import type { FileData } from "react-diff-view";
import { buildDiffFileTree } from "../../buildDiffFileTree";
import { filePath } from "../../FileDiff";
import { treeFileKeys } from "../../treeFileKeys";

export function orderFilesByTree(files: FileData[]): FileData[] {
	const order = new Map(
		treeFileKeys(buildDiffFileTree(files)).map((fileKey, index) => [
			fileKey,
			index,
		]),
	);

	return [...files].sort(
		(a, b) => (order.get(filePath(a)) ?? 0) - (order.get(filePath(b)) ?? 0),
	);
}
