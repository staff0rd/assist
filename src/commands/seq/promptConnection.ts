import { assertUniqueName } from "../../shared/assertUniqueName";
import { promptInput, promptPassword } from "../../shared/promptInput";
import type { SeqConnection } from "./types";

export async function promptConnection(
	existingNames: string[],
): Promise<SeqConnection> {
	const name = await promptInput("name", "Connection name:", "default");
	assertUniqueName(existingNames, name);

	const url = await promptInput("url", "Seq URL:", "http://localhost:5341");
	const apiToken = await promptPassword("apiToken", "API token:");

	return { name, url, apiToken };
}
