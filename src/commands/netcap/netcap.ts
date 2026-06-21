import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname } from "node:path";
import chalk from "chalk";
import { createNetcapHandler } from "./createNetcapHandler";
import { prepareExtensionForLoad } from "./prepareExtensionForLoad";
import { resolveNetcapOutPath } from "./resolveNetcapOutPath";

type NetcapOptions = {
	port: string;
	out?: string;
	filter?: string;
};

export async function netcap(options: NetcapOptions): Promise<void> {
	const port = Number(options.port);
	const outPath = resolveNetcapOutPath(options.out);
	const filter = options.filter ?? "";
	await mkdir(dirname(outPath), { recursive: true });
	const extensionPath = await prepareExtensionForLoad(port, filter);

	let count = 0;
	const handler = createNetcapHandler({
		outPath,
		onPing: () => console.log(chalk.dim("ping from extension")),
		onCapture: (entry) => {
			count += 1;
			console.log(
				chalk.green(`captured #${count}`),
				chalk.dim(`${entry.method ?? "?"} ${entry.url ?? "?"}`),
			);
		},
	});

	const server = createServer(handler);
	server.listen(port, () => {
		console.log(
			chalk.bold(`netcap receiver listening on http://127.0.0.1:${port}`),
		);
		console.log(chalk.dim(`appending captures to ${outPath}`));
		if (filter)
			console.log(chalk.dim(`forwarding only URLs matching "${filter}"`));
		console.log(chalk.dim(`load the unpacked extension from ${extensionPath}`));
		console.log(chalk.dim("press Ctrl-C to stop"));
	});

	process.on("SIGINT", () => {
		server.close();
		console.log(
			chalk.bold(
				`\nnetcap stopped — captured ${count} ${count === 1 ? "entry" : "entries"} to ${outPath}`,
			),
		);
		process.exit(0);
	});
}
