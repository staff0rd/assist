import { homedir } from "node:os";
import { join } from "node:path";

export function defaultCapturePath(): string {
	return join(homedir(), ".assist", "netcap", "capture.jsonl");
}
