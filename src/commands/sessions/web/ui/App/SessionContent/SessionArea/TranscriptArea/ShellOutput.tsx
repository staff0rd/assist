import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { shellSx } from "./shellSx";
import { splitShellUrls } from "./splitShellUrls";

function mergeStreams(chunks: SdkShellChunk[]): SdkShellChunk[] {
	const merged: SdkShellChunk[] = [];
	for (const chunk of chunks) {
		const prev = merged.at(-1);
		if (prev?.stream === chunk.stream) prev.text += chunk.text;
		else merged.push({ ...chunk });
	}
	return merged;
}

function ShellText({ text }: { text: string }) {
	return splitShellUrls(text).map((segment, i) =>
		segment.kind === "url" ? (
			<Link
				key={i}
				href={segment.text}
				target="_blank"
				rel="noopener noreferrer"
				underline="hover"
				sx={shellSx.link}
			>
				{segment.text}
			</Link>
		) : (
			segment.text
		),
	);
}

export function ShellOutput({ output }: { output: SdkShellChunk[] }) {
	const chunks = mergeStreams(output.filter((chunk) => chunk.text));
	if (!chunks.length) return null;
	return (
		<Box component="pre" sx={shellSx.output}>
			{chunks.map((chunk, i) => (
				<Box
					key={`${i}:${chunk.stream}`}
					component="span"
					sx={chunk.stream === "stderr" ? shellSx.stderr : undefined}
				>
					<ShellText text={chunk.text} />
				</Box>
			))}
		</Box>
	);
}
