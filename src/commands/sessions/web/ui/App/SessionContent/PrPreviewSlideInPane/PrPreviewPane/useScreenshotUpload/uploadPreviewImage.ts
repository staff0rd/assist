import type { PreviewAttachment } from "../../../../../../../shared/PreviewAttachment";

export async function uploadPreviewImage(
	file: File | Blob,
	cwd: string | undefined,
	node?: string,
): Promise<PreviewAttachment> {
	const params = new URLSearchParams();
	if (cwd) params.set("cwd", cwd);
	if (node) params.set("node", node);
	if (file instanceof File && file.name) params.set("name", file.name);

	const res = await fetch(`/api/pr-preview/upload-image?${params}`, {
		method: "POST",
		headers: { "Content-Type": file.type || "application/octet-stream" },
		body: file,
	});
	const body = (await res.json().catch(() => null)) as {
		path?: string;
		alt?: string;
		error?: string;
	} | null;
	if (!res.ok || !body?.path)
		throw new Error(body?.error ?? "Failed to attach file");
	return { path: body.path, alt: body.alt ?? "screenshot" };
}
