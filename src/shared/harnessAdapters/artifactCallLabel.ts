function str(v: unknown): string {
	return typeof v === "string" ? v.trim() : "";
}

function artifactAction(input: Record<string, unknown>): string {
	if (str(input.type_url)) return "create";
	return str(input.action) || "publish";
}

function artifactKeyValue(input: Record<string, unknown>): string {
	const filePath = str(input.file_path);
	return (
		str(input.intent) ||
		(filePath && (filePath.split(/[\\/]/).pop() ?? filePath)) ||
		str(input.url)
	);
}

export function artifactCallLabel(input: Record<string, unknown>): string {
	const title = str(input.title);
	if (title) return title;
	const action = artifactAction(input);
	const value = artifactKeyValue(input);
	return value ? `${action} · ${value}` : action;
}
