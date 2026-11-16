import { neutralizeCodexSkillMentions } from "./neutralizeCodexSkillMentions";

export function codexSkillPrompt(
	skill: string | undefined,
	prompt: string,
): string {
	return [skill && `$${skill}`, prompt && neutralizeCodexSkillMentions(prompt)]
		.filter(Boolean)
		.join(" ");
}
