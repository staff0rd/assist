import { execSync } from "node:child_process";
import Enquirer from "enquirer";
import { loadJson, saveJson } from "../../shared/loadJson";

type JiraConfig = {
	site?: string;
	email?: string;
};

const CONFIG_FILE = "jira.json";

async function promptCredentials(
	config: JiraConfig,
): Promise<{ site: string; email: string; token: string }> {
	const { Input, Password } = Enquirer as unknown as {
		Input: new (options: {
			name: string;
			message: string;
			initial?: string;
		}) => { run: () => Promise<string> };
		Password: new (options: {
			name: string;
			message: string;
		}) => { run: () => Promise<string> };
	};

	const site = await new Input({
		name: "site",
		message: "Jira site (e.g., mycompany.atlassian.net):",
		initial: config.site,
	}).run();

	const email = await new Input({
		name: "email",
		message: "Email:",
		initial: config.email,
	}).run();

	const token = await new Password({
		name: "token",
		message:
			"API token (https://id.atlassian.com/manage-profile/security/api-tokens):",
	}).run();

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
			encoding: "utf-8",
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
