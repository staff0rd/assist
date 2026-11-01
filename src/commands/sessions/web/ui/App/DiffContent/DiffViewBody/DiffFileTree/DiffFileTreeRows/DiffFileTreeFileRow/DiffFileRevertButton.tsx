import { DiffRevertIconButton } from "../../DiffRevertIconButton";

function confirmMessage(
	path: string,
	added: boolean,
	uncommittedOnly: boolean,
): string {
	if (added)
		return `This deletes ${path}, which is not in the last commit. This cannot be undone.`;
	if (uncommittedOnly)
		return `This discards only the uncommitted edits to ${path}. Its committed changes stay in the diff. This cannot be undone.`;
	return `This discards all uncommitted changes to ${path}. This cannot be undone.`;
}

export function DiffFileRevertButton({
	path,
	added,
	uncommittedOnly = false,
	onRevert,
}: {
	path: string;
	added: boolean;
	uncommittedOnly?: boolean;
	onRevert: (path: string) => void;
}) {
	return (
		<DiffRevertIconButton
			label="Revert file"
			title="Revert uncommitted changes to this file"
			confirmTitle="Revert file"
			confirmMessage={confirmMessage(path, added, uncommittedOnly)}
			onConfirm={() => onRevert(path)}
		/>
	);
}
