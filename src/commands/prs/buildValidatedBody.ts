import { buildPrBody } from "./buildPrBody";
import { validatePrContent } from "./validatePrContent";

type Sections = {
	title?: string;
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
};

export function buildValidatedBody(
	options: Sections,
	usage: string,
): { title: string; body: string } {
	if (!options.title || !options.what || !options.why) {
		console.error(usage);
		process.exit(1);
	}
	const body = buildPrBody({
		what: options.what,
		why: options.why,
		how: options.how,
		resolves: options.resolves,
	});
	validatePrContent(options.title, body);
	return { title: options.title, body };
}
