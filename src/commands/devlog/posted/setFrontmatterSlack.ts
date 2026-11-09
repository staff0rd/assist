const FRONTMATTER = /^---\n[\s\S]*?\n(?=---(?:\n|$))/;
const SLACK_LINE = /^slack:.*\n/m;

export function setFrontmatterSlack(
	contents: string,
	value: string,
): string | null {
	const match = contents.match(FRONTMATTER);
	if (!match) return null;
	const line = `slack: ${JSON.stringify(value)}\n`;
	const frontmatter = SLACK_LINE.test(match[0])
		? match[0].replace(SLACK_LINE, line)
		: `${match[0]}${line}`;
	return frontmatter + contents.slice(match[0].length);
}
