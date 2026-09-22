import Enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import type { ConfigKeyScope } from "./writeConfigKeys";

type SelectOptions = {
	name: string;
	message: string;
	choices: { name: string; message: string }[];
};

const prompts = Enquirer as unknown as {
	Select: new (options: SelectOptions) => { run: () => Promise<string> };
};

export async function promptConfigScope(): Promise<ConfigKeyScope> {
	const answer = await exitOnCancel(
		new prompts.Select({
			name: "scope",
			message: "Where should these values be written?",
			choices: [
				{
					name: "project",
					message: "assist.yml in this repo — checked in, shared with the team",
				},
				{
					name: "repo",
					message:
						"this repo's block in ~/.assist.yml — personal, as 'config set -g --repo' writes it",
				},
			],
		}).run(),
	);
	return answer === "repo" ? "repo" : "project";
}
