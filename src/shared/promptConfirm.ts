import enquirer from "enquirer";
import { exitOnCancel } from "./exitOnCancel";

export async function promptConfirm(
	message: string,
	initial = true,
): Promise<boolean> {
	const { confirmed } = await exitOnCancel(
		enquirer.prompt<{ confirmed: boolean }>({
			type: "confirm",
			name: "confirmed",
			message,
			initial,
			// @ts-expect-error - enquirer types don't include symbols but it's supported
			symbols: {
				on: "[x]",
				off: "[ ]",
			},
		}),
	);
	return confirmed;
}
