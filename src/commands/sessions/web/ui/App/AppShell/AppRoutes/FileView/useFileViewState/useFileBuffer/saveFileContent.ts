import { withNode } from "../../../../../../withNode";
import { postJson } from "../../../../../postJson";

export type SavedFile = { content: string; mtimeMs: number };

type SaveRequest = {
	cwd: string;
	node?: string;
	path: string;
	content: string;
	mtimeMs: number;
};

export async function saveFileContent({
	cwd,
	node,
	path,
	content,
	mtimeMs,
}: SaveRequest): Promise<SavedFile> {
	const body = await postJson(
		withNode(
			`/api/file?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
			node,
		),
		{ content, mtimeMs },
		"Failed to save file",
	);
	if (typeof body.content !== "string")
		throw new Error("The server returned no file content");
	return {
		content: body.content,
		mtimeMs: typeof body.mtimeMs === "number" ? body.mtimeMs : mtimeMs,
	};
}
