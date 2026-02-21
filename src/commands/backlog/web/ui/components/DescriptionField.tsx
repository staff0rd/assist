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
		<div className="field">
			<label htmlFor="f-desc">
				Description{" "}
				<button
					type="button"
					className="preview-toggle"
					style={{ background: "none", border: "none", padding: 0 }}
					onClick={() => setShowPreview(!showPreview)}
				>
					(preview)
				</button>
			</label>
			<textarea
				id="f-desc"
				placeholder="Markdown supported"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{showPreview && <MarkdownPreview text={value} />}
		</div>
	);
}
