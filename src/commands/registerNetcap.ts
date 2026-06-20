import type { Command } from "commander";
import { netcap } from "./netcap/netcap";

export function registerNetcap(program: Command): void {
	program
		.command("netcap")
		.description(
			"Start a local receiver that captures browser network traffic (fetch/XHR) to a JSONL file via the netcap browser extension",
		)
		.option("-p, --port <port>", "Port to listen on", "8723")
		.action((options) => netcap(options));
}
