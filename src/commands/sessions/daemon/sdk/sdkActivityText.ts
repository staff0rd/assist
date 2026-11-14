type ContentBlock = {
	type: string;
	name?: string;
};

export const SDK_WORKING_ACTIVITY = "Working";

export function sdkActivityText(content: readonly ContentBlock[]): string {
	const tool = [...content]
		.reverse()
		.find((block) => block.type === "tool_use");
	return tool?.name
		? `${SDK_WORKING_ACTIVITY} · ${tool.name}`
		: SDK_WORKING_ACTIVITY;
}
