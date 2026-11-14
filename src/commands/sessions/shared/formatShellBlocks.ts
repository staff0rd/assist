import type { SdkShellChunk } from "./SdkShellRow";

type ShellResult = { command: string; output: SdkShellChunk[] };

function streamText(output: SdkShellChunk[], stream: SdkShellChunk["stream"]) {
	return output
		.filter((chunk) => chunk.stream === stream)
		.map((chunk) => chunk.text)
		.join("");
}

/* why: the same <bash-input>/<bash-stdout>/<bash-stderr> form Claude Code's
 * terminal bash mode writes, so Claude reads held results as it would there. */
export function formatShellBlocks(results: ShellResult[]): string {
	return results
		.map(
			({ command, output }) =>
				`<bash-input>${command}</bash-input>\n<bash-stdout>${streamText(output, "stdout").trimEnd()}</bash-stdout><bash-stderr>${streamText(output, "stderr").trimEnd()}</bash-stderr>`,
		)
		.join("\n");
}
