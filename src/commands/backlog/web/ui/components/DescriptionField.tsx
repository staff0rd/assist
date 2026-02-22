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
			className="border border-gray-200 rounded-md p-3 mt-2 min-h-[60px] bg-gray-50"
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
		<Field.Root className="mb-4">
			<Field.Label className="block font-medium mb-1 text-sm">
				Description{" "}
				<button
					type="button"
					className="text-xs text-blue-600 cursor-pointer ml-2 bg-transparent border-none p-0"
					onClick={() => setShowPreview(!showPreview)}
				>
					(preview)
				</button>
			</Field.Label>
			<Field.Control
				className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-[inherit] min-h-[120px] resize-y"
				render={<textarea />}
				placeholder="Markdown supported"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{showPreview && <MarkdownPreview text={value} />}
		</Field.Root>
	);
}
