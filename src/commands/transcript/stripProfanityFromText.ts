const INTERJECTION =
	/(?<=^|["',;:.!?—–…])\s*(?:oh,?\s+)?(?:fucking hell|bloody hell|fucking|fuck|shit)(?:\s*[.!?,…]+|\s*$)/gi;

const WH_EMPHASIS =
	/\b(whatever|whoever|wherever|whenever|however|what|who|whom|where|when|why|how|which)\s+the\s+(?:fuck|hell|heck)\b/gi;

const INTENSIFIER =
	/\b(?:fucking|fuckin'?|(?:god)?damn(?:ed)?)\s+(?=[a-z0-9])(?!(?:it|if|around|about|with|up|off|over|out)\b)/gi;

function tidy(text: string): string {
	return text
		.replace(/\s+/g, " ")
		.replace(/\s+([,.;:!?])/g, "$1")
		.replace(/,(?=\s*[.!?])/g, "")
		.replace(/^[\s,;:]+/, "")
		.replace(/[\s,;:]+$/, "");
}

export function stripProfanityFromText(text: string): string {
	const stripped = text
		.replace(INTERJECTION, " ")
		.replace(WH_EMPHASIS, "$1")
		.replace(INTENSIFIER, "");

	return stripped === text ? text : tidy(stripped);
}
