const PUNCTUATION_CODES: Record<string, string> = {
	"/": "Slash",
	".": "Period",
	",": "Comma",
	";": "Semicolon",
	"'": "Quote",
	"[": "BracketLeft",
	"]": "BracketRight",
	"\\": "Backslash",
	"-": "Minus",
	"=": "Equal",
	"`": "Backquote",
};

const NAMED_KEYS = [
	"Enter",
	"Space",
	"Escape",
	"Backspace",
	"Delete",
	"Insert",
	"Home",
	"End",
	"PageUp",
	"PageDown",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
];

export function hotkeyKeyCode(
	token: string,
): { code: string; label: string } | undefined {
	if (/^[a-z]$/i.test(token)) {
		const label = token.toUpperCase();
		return { code: `Key${label}`, label };
	}
	if (/^\d$/.test(token)) return { code: `Digit${token}`, label: token };
	const punctuation = PUNCTUATION_CODES[token];
	if (punctuation) return { code: punctuation, label: token };
	if (/^F([1-9]|1[0-2])$/i.test(token)) {
		const label = token.toUpperCase();
		return { code: label, label };
	}
	const named = NAMED_KEYS.find(
		(name) => name.toLowerCase() === token.toLowerCase(),
	);
	return named ? { code: named, label: named } : undefined;
}
