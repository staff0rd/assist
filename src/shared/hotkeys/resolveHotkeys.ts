import type { z } from "zod";
import {
	defaultHotkeys,
	type HotkeyBindings,
	type HotkeyName,
} from "./defaultHotkeys";
import type { hotkeysSchema } from "./hotkeysSchema";

export function resolveHotkeys(
	overrides: z.infer<typeof hotkeysSchema> | undefined,
): HotkeyBindings {
	const bindings: HotkeyBindings = { ...defaultHotkeys };
	for (const name of Object.keys(defaultHotkeys) as HotkeyName[]) {
		const override = overrides?.[name];
		if (override) bindings[name] = [override];
	}
	return bindings;
}
