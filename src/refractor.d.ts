declare module "refractor/core" {
	type RefractorNode = {
		type: string;
		value?: string;
		tagName?: string;
		properties?: Record<string, unknown>;
		children?: RefractorNode[];
	};
	type Refractor = {
		register(grammar: unknown): void;
		highlight(value: string, language: string): RefractorNode[];
	};
	const refractor: Refractor;
	export default refractor;
}

declare module "refractor/lang/*" {
	const grammar: unknown;
	export default grammar;
}
