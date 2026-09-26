import chalk from "chalk";
import { loadConfig } from "../../../shared/loadConfig";
import type { LinkStatus } from "../daemon/links/LinkStatus";
import { resolveNodeName } from "../shared/resolveNodeName";
import { queryNodes } from "./queryNodes";

type NodesReport = {
	local: string;
	daemonRunning: boolean;
	links: LinkStatus[];
};

async function nodesReport(): Promise<NodesReport> {
	const live = await queryNodes();
	if (live)
		return { local: live.local, daemonRunning: true, links: live.links };
	const configured = loadConfig().sessions?.links ?? [];
	return {
		local: resolveNodeName(),
		daemonRunning: false,
		links: configured.map((link) => ({ ...link, state: "disconnected" })),
	};
}

const STATE_COLOURS: Record<string, (text: string) => string> = {
	connected: chalk.green,
	connecting: chalk.yellow,
	disconnected: chalk.red,
	"version-blocked": chalk.red,
};

function formatLink(link: LinkStatus): string {
	const colour = STATE_COLOURS[link.state] ?? chalk.white;
	const peer = link.peerVersion ? ` peer ${link.peerVersion}` : "";
	const error = link.error
		? `\n    ${chalk.dim(`last error${link.errorAt ? ` ${link.errorAt}` : ""}: ${link.error}`)}`
		: "";
	return `  ${link.name} ${colour(link.state)} direct ${link.url}${peer}${error}`;
}

export async function listNodes(options: { json?: boolean }): Promise<void> {
	const report = await nodesReport();
	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}
	console.log(`${report.local} ${chalk.dim("(this node)")}`);
	if (!report.daemonRunning)
		console.log(chalk.dim("  daemon not running; showing configured links"));
	if (report.links.length === 0) console.log(chalk.dim("  no links"));
	for (const link of report.links) console.log(formatLink(link));
}
