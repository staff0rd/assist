function isAttachable(type: string): boolean {
	return type.startsWith("image/") || type.startsWith("video/");
}

export function imageFromClipboard(data: DataTransfer | null): File | null {
	if (!data) return null;
	for (const item of data.items) {
		if (item.kind === "file" && isAttachable(item.type)) {
			const file = item.getAsFile();
			if (file) return file;
		}
	}
	return null;
}

export function imageFromDrop(data: DataTransfer | null): File | null {
	if (!data) return null;
	return Array.from(data.files).find((f) => isAttachable(f.type)) ?? null;
}
