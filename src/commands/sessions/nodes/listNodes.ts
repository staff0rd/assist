import chalk from "chalk";
import type { LinkStatus } from "../daemon/links/LinkStatus";
import { loadLinkSpecs } from "../shared/loadLinkSpecs";
import { resolveNodeName } from "../shared/resolveNodeName";
import { formatLink } from "./formatLink";
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
	return {
		local: resolveNodeName(),
		daemonRunning: false,
		links: loadLinkSpecs().map((link) => ({ ...link, state: "disconnected" })),
	};
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
