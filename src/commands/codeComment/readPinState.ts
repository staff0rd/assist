import { existsSync, readFileSync } from "node:fs";
import { getPinStatePath } from "./getRestrictedDir";

type PinState = { pin: string; file: string; line: number; text: string };

export function readPinState(pin: string): PinState | undefined {
	const path = getPinStatePath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const state: PinState = JSON.parse(readFileSync(path, "utf8"));
		if (state.pin !== pin) return undefined;
		return state;
	} catch {
		return undefined;
	}
}
