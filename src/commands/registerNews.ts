import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { add as newsAdd } from "./news/add";
import { newsConfigHelp } from "./news/newsConfigHelp";

export function registerNews(program: Command): void {
	const newsCommand = program
		.command("news")
		.description("Manage RSS news feeds");

	newsCommand
		.command("add")
		.description("Add an RSS feed URL")
		.argument("<url>", "RSS feed URL")
		.action(newsAdd);

	configHelp(newsCommand, newsConfigHelp);
}
