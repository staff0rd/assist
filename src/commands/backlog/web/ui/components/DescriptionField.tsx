import { Field } from "@base-ui/react/field";
import { marked } from "marked";
import { useState } from "react";

type DescriptionFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

function MarkdownPreview({ text }: { text: string }) {
	return (
		<div
			className="preview-box"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markdown preview requires innerHTML
			dangerouslySetInnerHTML={{
				__html: marked.parse(text || "") as string,
			}}
		/>
	);
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<Field.Root className="field">
			<Field.Label>
				Description{" "}
				<button
					type="button"
					className="preview-toggle"
					style={{ background: "none", border: "none", padding: 0 }}
					onClick={() => setShowPreview(!showPreview)}
				>
					(preview)
				</button>
			</Field.Label>
			<Field.Control
				render={<textarea />}
				placeholder="Markdown supported"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{showPreview && <MarkdownPreview text={value} />}
		</Field.Root>
	);
}
