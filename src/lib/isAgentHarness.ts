import { isClaudeCode } from "./isClaudeCode";
import { isCodex } from "./isCodex";

export function isAgentHarness(): boolean {
	return isClaudeCode() || isCodex();
}
