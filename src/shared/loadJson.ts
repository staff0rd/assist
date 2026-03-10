import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function getStoreDir(): string {
	return join(homedir(), ".assist");
}

function getStorePath(filename: string): string {
	return join(getStoreDir(), filename);
}

export function loadJson<T extends object>(filename: string): T {
	const path = getStorePath(filename);
	if (existsSync(path)) {
		try {
			return JSON.parse(readFileSync(path, "utf-8"));
		} catch {
			return {} as T;
		}
	}
	return {} as T;
}

export function saveJson<T extends object>(filename: string, data: T): void {
	const dir = getStoreDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(getStorePath(filename), JSON.stringify(data, null, 2));
}
