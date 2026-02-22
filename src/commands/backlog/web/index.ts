import { exec } from "node:child_process";
import { createServer } from "node:http";
import chalk from "chalk";
import { handleRequest } from "./handleRequest";

export async function web(options: { port: string }): Promise<void> {
	const port = Number.parseInt(options.port, 10);
	const url = `http://localhost:${port}`;

	const server = createServer((req, res) => {
		handleRequest(req, res, port);
	});

	server.listen(port, () => {
		console.log(chalk.green(`Backlog web view: ${url}`));
		console.log(chalk.dim("Press Ctrl+C to stop"));
		exec(`open ${url}`);
	});
}
