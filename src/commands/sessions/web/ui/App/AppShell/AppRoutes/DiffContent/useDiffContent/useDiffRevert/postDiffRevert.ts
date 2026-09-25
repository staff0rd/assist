export async function postDiffRevert(cwd: string, path: string): Promise<void> {
	const res = await fetch(
		`/api/diff/revert?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
		{ method: "POST" },
	);
	if (res.ok) return;
	const body = await res.json().catch(() => ({}));
	throw new Error(
		typeof body.error === "string" ? body.error : "Failed to revert file",
	);
}
