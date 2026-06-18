import { Box, Link, TextField, Typography } from "@mui/material";
import { marked } from "marked";
import { useState } from "react";

type DescriptionFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

function MarkdownPreview({ text }: { text: string }) {
	return (
		<Box
			sx={(theme) => ({
				border: 1,
				borderColor: "divider",
				borderRadius: 1,
				p: 1.5,
				mt: 1,
				minHeight: 60,
				bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
			})}
			dangerouslySetInnerHTML={{
				__html: marked.parse(text || "") as string,
			}}
		/>
	);
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="body2" sx={{ fontWeight: "medium", mb: 0.5 }}>
				Description{" "}
				<Link
					component="button"
					type="button"
					variant="caption"
					onClick={() => setShowPreview(!showPreview)}
					sx={{ ml: 1 }}
				>
					(preview)
				</Link>
			</Typography>
			<TextField
				fullWidth
				multiline
				minRows={4}
				size="small"
				placeholder="Markdown supported"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{showPreview && <MarkdownPreview text={value} />}
		</Box>
	);
}
