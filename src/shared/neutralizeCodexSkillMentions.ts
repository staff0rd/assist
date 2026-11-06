const WORD_JOINER = "⁠";

export function neutralizeCodexSkillMentions(prompt: string): string {
	return prompt.replace(/\$(?=[a-z])/g, `$${WORD_JOINER}`);
}
