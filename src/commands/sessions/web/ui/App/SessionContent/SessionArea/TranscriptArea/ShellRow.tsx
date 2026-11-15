import Box from "@mui/material/Box";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { shellSx } from "./shellSx";
import { ShellOutput } from "./ShellOutput";
import { FinishedMeta } from "./FinishedMeta";
import { ShellStopButton } from "./ShellStopButton";
import { ShellDiscardButton } from "./ShellDiscardButton";
import { RunningMeta } from "./RunningMeta";

type ShellRowStatus = "running" | "held" | "sent";

type Props = {
	command: string;
	output: SdkShellChunk[];
	status: ShellRowStatus;
	startedAt?: number;
	exitCode?: number;
	durationMs?: number;
	stopped?: boolean;
	onStop?: () => void;
	onDiscard?: () => void;
};

export function ShellRow(props: Props) {
	const { command, output, status, startedAt } = props;
	return (
		<Box sx={[shellSx.row, status === "held" && { borderLeftStyle: "dashed" }]}>
			<Box sx={shellSx.header}>
				<Box component="span" sx={shellSx.bang}>
					!
				</Box>
				<Box component="span" sx={shellSx.command} title={command}>
					{command}
				</Box>
				{status === "held" && props.onDiscard && (
					<ShellDiscardButton command={command} onDiscard={props.onDiscard} />
				)}
			</Box>
			<ShellOutput output={output} />
			<Box sx={shellSx.meta}>
				{status === "running" ? (
					<>
						<RunningMeta startedAt={startedAt ?? Date.now()} />
						{props.onStop && <ShellStopButton onStop={props.onStop} />}
					</>
				) : (
					<FinishedMeta
						sent={status === "sent"}
						exitCode={props.exitCode}
						stopped={props.stopped}
						durationMs={props.durationMs}
					/>
				)}
			</Box>
		</Box>
	);
}
