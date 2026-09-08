import chalk from "chalk";
import { resolveLitellmConfig } from "./resolveLitellmConfig";

export function parseModelIds(body: string): string[] {
	const parsed = JSON.parse(body) as { data?: { id?: unknown }[] };
	return (parsed.data ?? [])
		.map((model) => model.id)
		.filter((id): id is string => typeof id === "string")
		.sort();
}

export async function listModels(options: { json?: boolean }): Promise<void> {
	const { baseUrl, apiKey } = resolveLitellmConfig();

	let response: Response;
	try {
		response = await fetch(`${baseUrl}/v1/models`, {
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
		});
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		console.error(
			chalk.red(`Failed to reach LiteLLM at ${baseUrl}: ${reason}`),
		);
		process.exit(1);
	}

	const body = await response.text();
	if (!response.ok) {
		console.error(chalk.red(`LiteLLM returned ${response.status}: ${body}`));
		process.exit(1);
	}

	if (options.json) {
		console.log(body);
		return;
	}

	for (const id of parseModelIds(body)) console.log(id);
}
