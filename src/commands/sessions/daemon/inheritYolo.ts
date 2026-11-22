import type { Session } from "./createSession";

export function inheritYolo(
	d: Record<string, unknown>,
	lookup: (id: string) => Session | undefined,
): void {
	const parentId = d.yoloFrom;
	if (typeof parentId !== "string") return;
	delete d.yoloFrom;
	if (lookup(parentId)?.yolo) d.yolo = true;
}
