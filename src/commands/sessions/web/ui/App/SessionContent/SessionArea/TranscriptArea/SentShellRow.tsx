import type { ShellBlock } from "../../../../../../shared/splitShellBlocks";
import { ShellRow } from "./ShellRow";

export function SentShellRow({ command, stdout, stderr }: ShellBlock) {
	return (
		<ShellRow
			command={command}
			output={[
				{ stream: "stdout", text: stdout },
				{ stream: "stderr", text: stderr },
			]}
			status="sent"
		/>
	);
}
