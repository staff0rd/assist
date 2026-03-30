import { existsSync, readFileSync } from "node:fs";
import type { Signal } from "./writeSignal";
import { getSignalPath } from "./writeSignal";

export function readSignal(): Signal | undefined {
	const path = getSignalPath();
	if (!existsSync(path)) return undefined;
	try {
		return JSON.parse(readFileSync(path, "utf-8")) as Signal;
	} catch {
		return undefined;
	}
}
