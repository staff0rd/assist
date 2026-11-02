type ManualTextSegment = {
	text: string;
	code: boolean;
	href?: string;
};

const LINKS =
	/(https?:\/\/[^\s<>`]*[^\s<>`.,;:!?)'"])|(?<![\w./~:-])((?:[\w.-]+\/)+[\w-]+(?:\.[\w-]+)+)/g;

function linkify(
	text: string,
	code: boolean,
	blobUrl: string,
): ManualTextSegment[] {
	const segments: ManualTextSegment[] = [];
	let last = 0;
	for (const match of text.matchAll(LINKS)) {
		const [whole, url, path] = match;
		if (match.index > last)
			segments.push({ text: text.slice(last, match.index), code });
		segments.push({
			text: whole,
			code,
			href: url ?? `${blobUrl}/${path}`,
		});
		last = match.index + whole.length;
	}
	if (last < text.length) segments.push({ text: text.slice(last), code });
	return segments;
}

export function manualTextSegments(
	text: string,
	repo: string,
	headSha: string,
): ManualTextSegment[] {
	const blobUrl = `https://github.com/${repo}/blob/${headSha}`;
	return text
		.split("`")
		.flatMap((part, index) =>
			part ? linkify(part, index % 2 === 1, blobUrl) : [],
		);
}
