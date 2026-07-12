import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readDesignSystemPrompt(): string {
	const promptPath = path.join(__dirname, "..", "claude", "system-prompt.md");
	return fs.readFileSync(promptPath, "utf8");
}
