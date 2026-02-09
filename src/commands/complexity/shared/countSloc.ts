export function countSloc(content: string): number {
	let inMultiLineComment = false;
	let count = 0;

	for (const line of content.split("\n")) {
		const trimmed = line.trim();

		if (inMultiLineComment) {
			if (trimmed.includes("*/")) {
				inMultiLineComment = false;
				const afterComment = trimmed.substring(trimmed.indexOf("*/") + 2);
				if (afterComment.trim().length > 0) {
					count++;
				}
			}
			continue;
		}

		if (trimmed.startsWith("//")) {
			continue;
		}

		if (trimmed.startsWith("/*")) {
			if (trimmed.includes("*/")) {
				const afterComment = trimmed.substring(trimmed.indexOf("*/") + 2);
				if (afterComment.trim().length > 0) {
					count++;
				}
			} else {
				inMultiLineComment = true;
			}
			continue;
		}

		if (trimmed.length > 0) {
			count++;
		}
	}

	return count;
}
