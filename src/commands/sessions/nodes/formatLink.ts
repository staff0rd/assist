import chalk from "chalk";
import type { LinkStatus } from "../daemon/links/LinkStatus";

const STATE_COLOURS: Record<string, (text: string) => string> = {
	connected: chalk.green,
	connecting: chalk.yellow,
	disconnected: chalk.red,
	"version-blocked": chalk.red,
};

export function formatLink(link: LinkStatus): string {
	const colour = STATE_COLOURS[link.state] ?? chalk.white;
	const peer = link.peerVersion ? ` peer ${link.peerVersion}` : "";
	const error = link.error
		? `\n    ${chalk.dim(`last error${link.errorAt ? ` ${link.errorAt}` : ""}: ${link.error}`)}`
		: "";
	return `  ${link.name} ${colour(link.state)} direct ${link.url}${peer}${error}`;
}
