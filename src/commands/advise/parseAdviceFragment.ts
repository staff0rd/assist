import { parse as parseYaml } from "yaml";

export type AdviceFragment = {
	name: string;
	title: string;
	when: string;
	body: string;
};

const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseAdviceFragment(
	name: string,
	content: string,
): AdviceFragment {
	const match = frontmatter.exec(content);
	if (!match) throw new Error(`Advice fragment ${name} has no frontmatter`);

	const meta = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
	const title = meta.title;
	const when = meta.when;
	if (typeof title !== "string" || typeof when !== "string")
		throw new Error(
			`Advice fragment ${name} needs a title and a when condition`,
		);

	return {
		name,
		title,
		when,
		body: content.slice(match[0].length).trim(),
	};
}
