import { postJson } from "../../../../../postJson";

export type SavedFile = { content: string; mtimeMs: number };

export async function saveFileContent(
	cwd: string,
	path: string,
	content: string,
	mtimeMs: number,
): Promise<SavedFile> {
	const body = await postJson(
		`/api/file?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
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
