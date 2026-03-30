import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "./exitOnCancel";

type SelectOption = {
	name: string;
	value: string;
	description: string;
};

export async function promptMultiselect(
	message: string,
	options: SelectOption[],
): Promise<string[]> {
	const { selected } = await exitOnCancel(
		enquirer.prompt<{ selected: string[] }>({
			type: "multiselect",
			name: "selected",
			message,
			choices: options.map((opt) => ({
				name: opt.value,
				message: `${opt.name} - ${chalk.dim(opt.description)}`,
			})),
			// @ts-expect-error - enquirer types don't include symbols but it's supported
			symbols: {
				indicator: {
					on: "[x]",
					off: "[ ]",
				},
			},
		}),
	);
	return selected;
}
