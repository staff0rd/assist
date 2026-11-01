import { bulkRevertMessage } from "../../../../bulkRevertMessage";
import { DiffRevertIconButton } from "../../DiffRevertIconButton";

export function DiffFolderRevertButton({
	path,
	paths,
	uncommittedOnly = false,
	onRevert,
}: {
	path: string;
	paths: string[];
	uncommittedOnly?: boolean;
	onRevert: (paths: string[]) => void;
}) {
	return (
		<DiffRevertIconButton
			label={`Revert folder ${path}`}
			title="Revert uncommitted changes in this folder"
			confirmTitle="Revert folder"
			confirmMessage={bulkRevertMessage(
				paths.length,
				`in ${path}`,
				uncommittedOnly,
			)}
			onConfirm={() => onRevert(paths)}
		/>
	);
}
