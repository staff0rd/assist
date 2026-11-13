import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { newsConfigHelp } from "./news/newsConfigHelp";
import { lazyAction } from "../shared/lazyAction";

export function registerNews(program: Command): void {
	const newsCommand = program
		.command("news")
		.description("Manage RSS news feeds");

	newsCommand
		.command("add")
		.description("Add an RSS feed URL to news.feeds")
		.argument("<url>", "RSS feed URL")
		.action(lazyAction(() => import("./news/add"), "add"));

	newsCommand
		.command("list")
		.description("List the RSS feed URLs in news.feeds")
		.action(lazyAction(() => import("./news/list"), "list"));

	newsCommand
		.command("remove")
		.description("Remove an RSS feed URL from news.feeds")
		.argument("<url>", "RSS feed URL")
		.action(lazyAction(() => import("./news/remove"), "remove"));

	configHelp(newsCommand, newsConfigHelp);
}
