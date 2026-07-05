import chalk from "chalk";
import { isYamlFile } from "../../shared/isYamlFile";
import { validateCommentText } from "./validateCommentText";
import { issuePin } from "./issuePin";

export function codeCommentSet(file: string, line: string, text: string): void {
	const lineNumber = Number.parseInt(line, 10);
	if (!Number.isInteger(lineNumber) || lineNumber < 1) {
		console.error(chalk.red(`Invalid line number: ${line}`));
		process.exitCode = 1;
		return;
	}

	const marker = isYamlFile(file) ? "#" : "//";
	const validation = validateCommentText(text, isYamlFile(file));
	if (!validation.ok) {
		console.error(chalk.red(`Refused: ${validation.reason}`));
		console.error(chalk.red("No pin issued."));
		process.exitCode = 1;
		return;
	}

	console.error(
		chalk.yellow.bold(
			"THIS IS YOUR LAST CHANCE TO RECONSIDER BEFORE INVOLVING A HUMAN.\n" +
				"Requesting this pin pages a real person to approve a comment. DO NOT WASTE THEIR TIME.\n" +
				"You had BETTER BE RIGHT that this comment is genuinely necessary.\n\n" +
				"Comments are a last resort, not a habit. Almost every comment you reach for is a sign\n" +
				"the code should be clearer instead. Before a human is pulled in, ask whether a better\n" +
				"name, a smaller function, or a test would make the comment redundant. ONLY if you are\n" +
				"certain this one line earns its keep should you proceed to the confirm step below.",
		),
	);

	const delivered = issuePin(file, lineNumber, validation.text);

	if (!delivered) {
		console.error(
			chalk.red(
				"Could not deliver the confirmation pin via notification.\n" +
					"The comment cannot be confirmed until the notification channel works.",
			),
		);
		process.exitCode = 1;
		return;
	}

	console.log(
		`A confirmation pin was sent to your desktop notifications.\nTo insert "${marker} ${validation.text}" at ${file}:${lineNumber}, run:\n${chalk.cyan("  assist code-comment confirm <PIN>")}\nusing the pin from that notification.`,
	);
}
