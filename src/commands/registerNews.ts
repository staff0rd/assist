import type { Command } from "commander";
import { add as newsAdd, web as newsWeb } from "./news";

export function registerNews(program: Command): void {
	const newsCommand = program
		.command("news")
		.description("View latest news from configured RSS feeds")
		.action(() => newsWeb({ port: "3001" }));

	newsCommand
		.command("add")
		.description("Add an RSS feed URL to the config")
		.argument("<url>", "RSS feed URL")
		.action(newsAdd);

	newsCommand
		.command("web")
		.description("Start a web view of the news feeds")
		.option("-p, --port <number>", "Port to listen on", "3001")
		.action(newsWeb);
}
