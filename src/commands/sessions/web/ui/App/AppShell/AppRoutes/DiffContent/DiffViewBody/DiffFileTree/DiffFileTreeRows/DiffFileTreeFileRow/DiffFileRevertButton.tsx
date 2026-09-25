import { DiffRevertIconButton } from "../../DiffRevertIconButton";

export function DiffFileRevertButton({
	path,
	added,
	onRevert,
}: {
	path: string;
	added: boolean;
	onRevert: (path: string) => void;
}) {
	return (
		<DiffRevertIconButton
			label="Revert file"
			title="Revert uncommitted changes to this file"
			confirmTitle="Revert file"
			confirmMessage={
				added
					? `This deletes ${path}, which is not in the last commit. This cannot be undone.`
					: `This discards all uncommitted changes to ${path}. This cannot be undone.`
			}
			onConfirm={() => onRevert(path)}
		/>
	);
}
