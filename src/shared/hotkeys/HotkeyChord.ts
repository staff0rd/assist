export type HotkeyModifier = "Mod" | "Ctrl" | "Alt" | "Shift" | "Meta";

export type HotkeyChord = {
	modifiers: HotkeyModifier[];
	key?: { code: string; label: string };
};
