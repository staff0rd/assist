import { DiffRevertIconButton } from "../../DiffRevertIconButton";

export function DiffFolderRevertButton({
	path,
	paths,
	onRevert,
}: {
	path: string;
	paths: string[];
	onRevert: (paths: string[]) => void;
}) {
	const label = paths.length === 1 ? "file" : "files";

	return (
		<DiffRevertIconButton
			label={`Revert folder ${path}`}
			title="Revert uncommitted changes in this folder"
			confirmTitle="Revert folder"
			confirmMessage={`This discards all uncommitted changes to ${paths.length} ${label} in ${path}. This cannot be undone.`}
			onConfirm={() => onRevert(paths)}
		/>
	);
}
