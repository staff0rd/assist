type ToolResult = {
	content: (
		| { type: "text"; text: string }
		| { type: "image"; data: string; mimeType: string }
	)[];
	isError?: boolean;
};

export async function toolResult(
	action: () => Promise<string | ToolResult>,
): Promise<ToolResult> {
	try {
		const result = await action();
		return typeof result === "string"
			? { content: [{ type: "text", text: result }] }
			: result;
	} catch (error) {
		const text = error instanceof Error ? error.message : String(error);
		return { content: [{ type: "text", text }], isError: true };
	}
}
