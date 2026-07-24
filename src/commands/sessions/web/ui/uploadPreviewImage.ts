export class UploadImageError extends Error {
	name = "UploadImageError";
	command?: string;
	constructor(message: string, command?: string) {
		super(message);
		this.command = command;
	}
}

export async function uploadPreviewImage(
	file: File | Blob,
	cwd: string | undefined,
): Promise<string> {
	const params = new URLSearchParams();
	if (cwd) params.set("cwd", cwd);
	if (file instanceof File && file.name) params.set("name", file.name);

	const res = await fetch(`/api/pr-preview/upload-image?${params}`, {
		method: "POST",
		headers: { "Content-Type": file.type || "application/octet-stream" },
		body: file,
	});
	const body = (await res.json().catch(() => null)) as {
		markdown?: string;
		error?: string;
		command?: string;
	} | null;
	if (!res.ok || !body?.markdown)
		throw new UploadImageError(
			body?.error ?? "Failed to upload image",
			body?.command,
		);
	return body.markdown;
}
