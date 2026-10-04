import type { HotkeyChord } from "./HotkeyChord";
import { hotkeyKeyCode } from "./hotkeyKeyCode";
import { parseModifiers } from "./parseModifiers";

type ParseChordResult =
	| { ok: true; chord: HotkeyChord }
	| { ok: false; error: string };

export function parseChord(
	text: string,
	{ modifiersOnly = false }: { modifiersOnly?: boolean } = {},
): ParseChordResult {
	const tokens = text.split("+").map((token) => token.trim());
	const keyToken = modifiersOnly ? undefined : tokens.pop();
	const parsed = parseModifiers(tokens, text);
	if (!parsed.ok) return parsed;
	const { modifiers } = parsed;
	if (keyToken === undefined) return { ok: true, chord: { modifiers } };
	const key = hotkeyKeyCode(keyToken);
	if (!key)
		return { ok: false, error: `"${keyToken}" is not a key in "${text}"` };
	return { ok: true, chord: { modifiers, key } };
}
