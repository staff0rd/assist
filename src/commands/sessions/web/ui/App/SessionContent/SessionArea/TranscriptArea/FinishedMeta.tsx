import Box from "@mui/material/Box";
import { formatShellDuration } from "./formatShellDuration";
import { shellSx } from "./shellSx";

export function FinishedMeta({
	sent,
	exitCode,
	durationMs,
}: {
	sent: boolean;
	exitCode?: number;
	durationMs?: number;
}) {
	return (
		<>
			{exitCode !== undefined && (
				<Box component="span" sx={exitCode === 0 ? shellSx.ok : shellSx.bad}>
					exit {exitCode}
				</Box>
			)}
			{durationMs !== undefined && (
				<span>{formatShellDuration(durationMs)}</span>
			)}
			{sent ? (
				<span>Sent with your message</span>
			) : (
				<Box component="span" sx={shellSx.attached}>
					Attached to your next message
				</Box>
			)}
		</>
	);
}
