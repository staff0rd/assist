import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";

export async function handleIncompletePhase(): Promise<
	"retry" | "skip" | "abort"
> {
	const { action } = await exitOnCancel(
		enquirer.prompt<{ action: string }>({
			type: "select",
			name: "action",
			message: "Phase was not marked complete. What would you like to do?",
			choices: ["Retry this phase", "Skip to next phase", "Abort"],
		}),
	);
	if (action === "Retry this phase") return "retry";
	if (action === "Skip to next phase") return "skip";
	return "abort";
}
