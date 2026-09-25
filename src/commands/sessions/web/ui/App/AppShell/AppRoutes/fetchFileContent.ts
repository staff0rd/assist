export type FileContentState =
	| { status: "loading" }
	| { status: "absent" }
	| { status: "too-large" }
	| { status: "error" }
	| { status: "ready"; content: string; mtimeMs: number };

export async function fetchFileContent(
	cwd: string,
	path: string,
): Promise<FileContentState> {
	try {
		const res = await fetch(
			`/api/file?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
		);
		if (res.status === 404) return { status: "absent" };
		if (res.status === 413) return { status: "too-large" };
		if (!res.ok) return { status: "error" };
		const body = await res.json();
		if (typeof body.content !== "string") return { status: "error" };
		return {
			status: "ready",
			content: body.content,
			mtimeMs: typeof body.mtimeMs === "number" ? body.mtimeMs : 0,
		};
	} catch {
		return { status: "error" };
	}
}
