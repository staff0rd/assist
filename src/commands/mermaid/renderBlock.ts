import chalk from "chalk";

export async function renderBlock(
	krokiUrl: string,
	source: string,
): Promise<string> {
	const response = await fetch(`${krokiUrl}/mermaid/svg`, {
		method: "POST",
		headers: { "Content-Type": "text/plain" },
		body: source,
	});
	if (!response.ok) {
		console.error(
			chalk.red(
				`Kroki request failed: ${response.status} ${response.statusText}`,
			),
		);
		console.error(await response.text());
		process.exit(1);
	}
	return await response.text();
}
