import type { Command } from "commander";
import { lazyAction } from "../shared/lazyAction";

export function registerNetcap(program: Command): void {
	const command = program
		.command("netcap")
		.description(
			"Start a local receiver that captures browser network traffic (fetch/XHR) to a JSONL file via the netcap browser extension",
		)
		.option("-p, --port <port>", "Port to listen on", "8723")
		.option(
			"-o, --out <dir>",
			"Directory to write the capture file into (default ~/.assist/netcap)",
		)
		.option(
			"-f, --filter <pattern>",
			"Only forward requests whose URL contains this substring",
		)
		.action(lazyAction(() => import("./netcap/netcap"), "netcap"));

	command
		.command("extract-linkedin-posts [file]")
		.description(
			"Extract LinkedIn posts (text, author, mentions, links, permalink) from a netcap capture file to posts.json",
		)
		.action(
			lazyAction(() => import("./netcap/netcapExtract"), "netcapExtract"),
		);
}
