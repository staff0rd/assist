import type { Command } from "commander";
import { add as newsAdd } from "./news";

export function registerNews(program: Command): void {
	const newsCommand = program
		.command("news")
		.description("Manage RSS news feeds");

	newsCommand
		.command("add")
		.description("Add an RSS feed URL")
		.argument("<url>", "RSS feed URL")
		.action(newsAdd);
}
