import Box from "@mui/material/Box";
import { useLayoutEffect, useRef } from "react";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { shellSx } from "./shellSx";

const STICK_THRESHOLD_PX = 8;

export function WorkflowOutput({ lines }: { lines: SdkShellChunk[] }) {
	const ref = useRef<HTMLPreElement>(null);
	const stuck = useRef(true);
	useLayoutEffect(() => {
		const el = ref.current;
		if (el && stuck.current) el.scrollTop = el.scrollHeight;
	}, [lines]);
	if (!lines.length) return null;
	return (
		<Box
			ref={ref}
			component="pre"
			aria-label="Workflow output"
			sx={[shellSx.output, { ml: 1 }]}
			onScroll={(e) => {
				const el = e.currentTarget;
				stuck.current =
					el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX;
			}}
		>
			{lines.map((line, i) => (
				<Box
					key={i}
					component="span"
					sx={line.stream === "stderr" ? shellSx.stderr : undefined}
				>
					{i ? "\n" : ""}
					{line.text}
				</Box>
			))}
		</Box>
	);
}
