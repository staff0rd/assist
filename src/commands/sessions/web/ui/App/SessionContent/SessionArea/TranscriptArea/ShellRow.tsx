import Box from "@mui/material/Box";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { formatToolElapsed } from "./formatToolElapsed";
import { shellSx } from "./shellSx";
import { useTickingSeconds } from "./useTickingSeconds";
import { ShellOutput } from "./ShellOutput";
import { FinishedMeta } from "./FinishedMeta";
import { ShellStopButton } from "./ShellStopButton";

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
};

function RunningMeta({ startedAt }: { startedAt: number }) {
	const seconds = useTickingSeconds(
		Math.floor((Date.now() - startedAt) / 1000),
	);
	return <span>Running · {formatToolElapsed(seconds ?? 0)}</span>;
}

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
