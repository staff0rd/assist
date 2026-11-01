import type { UncommittedFiles } from "./uncommittedFiles";

type FileRevertState = { added: boolean; uncommittedOnly: boolean };

export function fileRevertState(
	file: { fileKey: string; isNew: boolean },
	uncommitted: UncommittedFiles | undefined,
): FileRevertState | null {
	if (!uncommitted) return { added: file.isNew, uncommittedOnly: false };
	if (!uncommitted.paths.has(file.fileKey)) return null;
	return {
		added: uncommitted.newPaths.has(file.fileKey),
		uncommittedOnly: true,
	};
}
