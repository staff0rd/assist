import { buildResumePrompt } from "./buildResumePrompt";

export function resumeNudge(): string {
	if (process.env.ASSIST_RESUME_IDLE) return "";
	return process.env.ASSIST_RESUME_PROMPT || buildResumePrompt();
}
