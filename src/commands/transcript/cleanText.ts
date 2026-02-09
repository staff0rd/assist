export function cleanText(text: string): string {
	const words = text.split(/\s+/);
	const cleaned: string[] = [];

	for (let i = 0; i < words.length; i++) {
		let isRepeat = false;

		for (let len = 3; len <= 8 && i + len <= words.length; len++) {
			const phrase = words
				.slice(i, i + len)
				.join(" ")
				.toLowerCase();
			const remaining = words
				.slice(i + len)
				.join(" ")
				.toLowerCase();

			if (remaining.startsWith(phrase)) {
				isRepeat = true;
				break;
			}
		}

		if (!isRepeat) {
			cleaned.push(words[i]);
		}
	}

	return cleaned.join(" ").replace(/\s+/g, " ").trim();
}
