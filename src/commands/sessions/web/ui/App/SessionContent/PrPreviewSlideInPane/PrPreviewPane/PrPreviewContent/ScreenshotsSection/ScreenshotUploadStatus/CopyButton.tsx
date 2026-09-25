import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
	const [copied, setCopied] = useState(false);
	const copy = () => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			})
			.catch(() => {});
	};
	return (
		<Tooltip title={copied ? "Copied" : label}>
			<IconButton size="small" aria-label={label} onClick={copy}>
				{copied ? (
					<CheckIcon fontSize="small" />
				) : (
					<ContentCopyIcon fontSize="small" />
				)}
			</IconButton>
		</Tooltip>
	);
}
