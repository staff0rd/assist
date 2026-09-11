export function reviewerLabel(name: string, model?: string): string {
	return model ? `${name} (${model})` : name;
}
