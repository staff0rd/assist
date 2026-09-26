import { withNode } from "../../../../withNode";

export async function postDiffRevert(
	cwd: string,
	path: string,
	node?: string,
): Promise<void> {
	const res = await fetch(
		withNode(
			`/api/diff/revert?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
			node,
		),
		{ method: "POST" },
	);
	if (res.ok) return;
	const body = await res.json().catch(() => ({}));
	throw new Error(
		typeof body.error === "string" ? body.error : "Failed to revert file",
	);
}
