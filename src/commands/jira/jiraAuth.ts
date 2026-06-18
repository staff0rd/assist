import { execSync } from "node:child_process";
import { loadJson, saveJson } from "../../shared/loadJson";
import { promptInput, promptPassword } from "../../shared/promptInput";

type JiraConfig = {
	site?: string;
	email?: string;
};

const CONFIG_FILE = "jira.json";

async function promptCredentials(
	config: JiraConfig,
): Promise<{ site: string; email: string; token: string }> {
	const site = await promptInput(
		"site",
		"Jira site (e.g., mycompany.atlassian.net):",
		config.site,
	);

	const email = await promptInput("email", "Email:", config.email);

	const token = await promptPassword(
		"token",
		"API token (https://id.atlassian.com/manage-profile/security/api-tokens):",
	);

	return { site, email, token };
}

export async function jiraAuth(): Promise<void> {
	const config = loadJson<JiraConfig>(CONFIG_FILE);

	try {
		const { site, email, token } = await promptCredentials(config);

		if (!site || !email || !token) {
			console.error("All fields are required.");
			process.exit(1);
		}

		execSync(`acli jira auth login --site ${site} --email "${email}" --token`, {
			encoding: "utf8",
			input: token,
			stdio: ["pipe", "inherit", "inherit"],
		});

		saveJson(CONFIG_FILE, { site, email });
		console.log("Successfully authenticated with Jira.");
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error authenticating with Jira:", error.message);
		}
		process.exit(1);
	}
}
