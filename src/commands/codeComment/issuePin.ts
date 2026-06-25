import { mkdirSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { showNotification } from "../notify/showNotification";
import { getPinStatePath, getRestrictedDir } from "./getRestrictedDir";
import { sweepRestrictedDir } from "./sweepRestrictedDir";

export function issuePin(
	file: string,
	lineNumber: number,
	text: string,
): boolean {
	const pin = generatePin();
	mkdirSync(getRestrictedDir(), { recursive: true });
	sweepRestrictedDir();
	writeFileSync(
		getPinStatePath(pin),
		JSON.stringify({ pin, file, line: lineNumber, text }),
	);

	return showNotification({
		title: "assist code-comment pin",
		message: `Pin ${pin} — run: assist code-comment confirm ${pin}`,
	});
}

function generatePin(): string {
	return randomInt(0, 1000).toString().padStart(3, "0");
}
