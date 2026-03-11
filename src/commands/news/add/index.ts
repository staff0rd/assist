import chalk from "chalk";
import enquirer from "enquirer";
import {
	loadGlobalConfigRaw,
	saveGlobalConfig,
} from "../../../shared/loadConfig";

export async function add(url?: string): Promise<void> {
	if (!url) {
		const response = await enquirer.prompt<{ url: string }>({
			type: "input",
			name: "url",
			message: "RSS feed URL:",
			validate: (value: string) => {
				try {
					new URL(value);
					return true;
				} catch {
					return "Please enter a valid URL";
				}
			},
		});
		url = response.url;
	}

	const config = loadGlobalConfigRaw();
	const news = (config.news as { feeds?: string[] }) ?? {};
	const feeds = news.feeds ?? [];

	if (feeds.includes(url)) {
		console.log(chalk.yellow("Feed already exists in config"));
		return;
	}

	feeds.push(url);
	config.news = { ...news, feeds };
	saveGlobalConfig(config);
	console.log(chalk.green(`Added feed: ${url}`));
}
