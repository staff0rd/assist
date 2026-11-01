const FIELD_LINE = /^\*\*[^*]+:\*\*/;

function isProse(paragraph: string) {
	return (
		paragraph !== "" &&
		!/^[#`{<|]/.test(paragraph) &&
		!FIELD_LINE.test(paragraph)
	);
}

export function previewSummary(body: string): string {
	const paragraph = body
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.find(isProse);
	if (!paragraph) return "";
	return paragraph
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[*_`>]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
