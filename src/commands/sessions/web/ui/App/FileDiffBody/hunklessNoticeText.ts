import type { FileData } from "react-diff-view";

type HunklessFile = Pick<
	FileData,
	"type" | "isBinary" | "oldPath" | "newPath" | "oldMode" | "newMode"
>;

export function hunklessNoticeText(file: HunklessFile): string {
	if (file.isBinary) return "Binary file — no preview.";
	if (file.type === "rename")
		return `Renamed without changes: ${file.oldPath} → ${file.newPath}`;
	if (file.type === "copy")
		return `Copied without changes: ${file.oldPath} → ${file.newPath}`;
	// gitdiff-parser only types an entry add/delete from its ---/+++ lines, which an empty file lacks; the mode lines still tell them apart.
	if (file.type === "add" || (file.newMode && !file.oldMode))
		return "Empty file added.";
	if (file.type === "delete" || (file.oldMode && !file.newMode))
		return "Empty file deleted.";
	return "File mode changed — no content changes.";
}
