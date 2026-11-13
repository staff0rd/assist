import {
	type GithubAssistMode,
	isGithubAssistMode,
} from "../../../../shared/githubAssistModes";
import { linkPrompt } from "./linkPrompt";
import type { GithubPlanError } from "./resolveGithubClone";
import { resolveSessionClone } from "./resolveSessionClone";

export function planGithubSession(
	body: unknown,
	baseDir: string,
	redirects?: Record<string, string>,
):
	| { ok: true; cwd: string; prompt: string; mode?: GithubAssistMode }
	| GithubPlanError {
	const { url, instructions, mode } = (body ?? {}) as Record<string, unknown>;
	if (mode !== undefined && !isGithubAssistMode(mode))
		return { ok: false, status: 400, error: `Unknown mode: ${mode}` };
	const clone = resolveSessionClone(url, baseDir, redirects);
	if (!clone.ok) return clone;
	const prompt = linkPrompt(clone.url, instructions);
	return { ok: true, cwd: clone.cwd, prompt, ...(mode && { mode }) };
}
