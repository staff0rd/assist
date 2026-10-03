import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton, Tooltip } from "@mui/material";
import { QuoteBlock } from "../../QuoteBlock";
import { useCopyFeedback } from "../../useCopyFeedback";

const wrapperSx = { position: "relative", pr: 3.5 } as const;
const buttonSx = { position: "absolute", top: -4, right: 0 } as const;
const glyphSx = { fontSize: "0.875rem" } as const;

export function CopyableQuote({ text }: { text: string }) {
	const { copied, copy } = useCopyFeedback(text);
	const label = copied ? "Copied" : "Copy quote";

	return (
		<Box sx={wrapperSx}>
			<QuoteBlock text={text} />
			<Tooltip title={label} open={copied || undefined}>
				<IconButton
					size="small"
					aria-label={label}
					onClick={copy}
					sx={buttonSx}
				>
					{copied ? (
						<CheckIcon sx={glyphSx} />
					) : (
						<ContentCopyIcon sx={glyphSx} />
					)}
				</IconButton>
			</Tooltip>
		</Box>
	);
}
