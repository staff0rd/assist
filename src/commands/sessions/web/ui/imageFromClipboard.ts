export function imageFromClipboard(data: DataTransfer | null): File | null {
	if (!data) return null;
	for (const item of data.items) {
		if (item.kind === "file" && item.type.startsWith("image/")) {
			const file = item.getAsFile();
			if (file) return file;
		}
	}
	return null;
}

export function imageFromDrop(data: DataTransfer | null): File | null {
	if (!data) return null;
	return (
		Array.from(data.files).find((f) => f.type.startsWith("image/")) ?? null
	);
}
