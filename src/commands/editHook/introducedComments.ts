/** Comments present in `added` that are not accounted for by `removed`. */
export function introducedComments(
	added: string[],
	removed: string[],
): string[] {
	const counts = new Map<string, number>();
	for (const comment of removed) {
		counts.set(comment, (counts.get(comment) ?? 0) + 1);
	}

	const candidates: string[] = [];
	for (const comment of added) {
		const remaining = counts.get(comment) ?? 0;
		if (remaining > 0) counts.set(comment, remaining - 1);
		else candidates.push(comment);
	}

	const removedWords = new Set(removed.flatMap(commentWords));
	return candidates.filter((comment) => {
		const words = commentWords(comment);
		if (words.length === 0) return true;
		return !words.every((word) => removedWords.has(word));
	});
}

function commentWords(comment: string): string[] {
	return comment
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 0);
}
