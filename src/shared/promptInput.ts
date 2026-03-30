import Enquirer from "enquirer";
import { exitOnCancel } from "./exitOnCancel";

type PromptOptions = { name: string; message: string; initial?: string };
type PromptConstructor<T extends PromptOptions> = new (
	options: T,
) => { run: () => Promise<string> };

const prompts = Enquirer as unknown as {
	Input: PromptConstructor<PromptOptions>;
	Password: PromptConstructor<{ name: string; message: string }>;
};

export async function promptInput(
	name: string,
	message: string,
	initial?: string,
): Promise<string> {
	return exitOnCancel(new prompts.Input({ name, message, initial }).run());
}

export async function promptPassword(
	name: string,
	message: string,
): Promise<string> {
	return exitOnCancel(new prompts.Password({ name, message }).run());
}
