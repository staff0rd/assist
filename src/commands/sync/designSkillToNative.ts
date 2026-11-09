import { commandToSkill } from "./commandToSkill";

export function designSkillToNative(name: string, content: string): string {
	const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
	const description = heading
		? `Design skill: ${heading}. Follow it when the design system prompt's Available skills chapter names ${name}.`
		: `Design skill ${name}`;
	return commandToSkill(
		name,
		`---\ndescription: ${description}\n---\n\n${content}`,
	);
}
