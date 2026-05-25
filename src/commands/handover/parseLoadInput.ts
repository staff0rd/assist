import type { LoadInput } from "./types";

export async function parseLoadInput(
	stdin: () => Promise<string>,
): Promise<LoadInput> {
	try {
		const raw = await stdin();
		if (!raw.trim()) return {};
		return JSON.parse(raw) as LoadInput;
	} catch {
		return {};
	}
}
