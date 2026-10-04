import type { HotkeyModifier } from "./HotkeyChord";

const MODIFIER_ALIASES: Record<string, HotkeyModifier> = {
	mod: "Mod",
	ctrl: "Ctrl",
	control: "Ctrl",
	alt: "Alt",
	option: "Alt",
	opt: "Alt",
	shift: "Shift",
	meta: "Meta",
	cmd: "Meta",
	command: "Meta",
	win: "Meta",
};

const MODIFIER_ORDER: HotkeyModifier[] = [
	"Mod",
	"Ctrl",
	"Alt",
	"Shift",
	"Meta",
];

export function parseModifiers(
	tokens: readonly string[],
	text: string,
): { ok: true; modifiers: HotkeyModifier[] } | { ok: false; error: string } {
	const modifiers = new Set<HotkeyModifier>();
	for (const token of tokens) {
		const modifier = MODIFIER_ALIASES[token.toLowerCase()];
		if (!modifier)
			return { ok: false, error: `"${token}" is not a modifier in "${text}"` };
		if (modifiers.has(modifier))
			return { ok: false, error: `"${token}" is repeated in "${text}"` };
		modifiers.add(modifier);
	}
	if (![...modifiers].some((modifier) => modifier !== "Shift"))
		return {
			ok: false,
			error: `"${text}" needs at least one of Mod, Ctrl, Alt or Meta`,
		};
	if (modifiers.has("Mod") && (modifiers.has("Ctrl") || modifiers.has("Meta")))
		return {
			ok: false,
			error: `"${text}" combines Mod with Ctrl or Meta, which Mod already means`,
		};
	return {
		ok: true,
		modifiers: MODIFIER_ORDER.filter((modifier) => modifiers.has(modifier)),
	};
}
