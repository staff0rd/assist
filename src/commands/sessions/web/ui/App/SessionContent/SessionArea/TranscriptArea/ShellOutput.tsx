import Box from "@mui/material/Box";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { shellSx } from "./shellSx";

export function ShellOutput({ output }: { output: SdkShellChunk[] }) {
	const chunks = output.filter((chunk) => chunk.text);
	if (!chunks.length) return null;
	return (
		<Box component="pre" sx={shellSx.output}>
			{chunks.map((chunk, i) => (
				<Box
					key={`${i}:${chunk.stream}`}
					component="span"
					sx={chunk.stream === "stderr" ? shellSx.stderr : undefined}
				>
					{chunk.text}
				</Box>
			))}
		</Box>
	);
}
