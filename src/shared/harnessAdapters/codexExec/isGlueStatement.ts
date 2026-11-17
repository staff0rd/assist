import { isOutputExpression } from "./isOutputExpression";
import { jsPatterns } from "./jsPatterns";

const { DECL, ID, PRINT } = jsPatterns;

type Loop = { pattern: RegExp; source: number; params: number[]; body: number };

const PRINT_EXPRESSION = new RegExp(`^${PRINT}\\((.+)\\)$`);
const FOR_EACH_PRINT = new RegExp(`^(${ID})\\.forEach\\(${PRINT}\\)$`);
const LOOPS: Loop[] = [
	{
		pattern: new RegExp(
			`^(${ID})\\.forEach\\(\\(?(${ID})(?:,(${ID}))?\\)?=>(.+)\\)$`,
		),
		source: 1,
		params: [2, 3],
		body: 4,
	},
	{
		pattern: new RegExp(`^for\\(${DECL}(${ID}) of (${ID})\\)(.+)$`),
		source: 2,
		params: [1],
		body: 3,
	},
	{
		pattern: new RegExp(
			`^for\\(${DECL}(${ID})=0;\\1<(${ID})\\.length;(?:\\1\\+\\+|\\+\\+\\1)\\)(.+)$`,
		),
		source: 2,
		params: [1],
		body: 3,
	},
];

export function isGlueBody(body: string, bound: ReadonlySet<string>): boolean {
	const inner = /^\{(.*)\}$/.exec(body)?.[1] ?? body;
	const statements = inner.split(";").filter(Boolean);
	return (
		statements.length > 0 &&
		statements.every((statement) => isGlueStatement(statement, bound))
	);
}

function isGlueLoop(code: string, bound: ReadonlySet<string>): boolean {
	for (const { pattern, source, params, body } of LOOPS) {
		const match = pattern.exec(code);
		if (!match) continue;
		const names = params.map((i) => match[i]).filter(Boolean);
		return (
			bound.has(match[source]) &&
			isGlueBody(match[body], new Set([...bound, ...names]))
		);
	}
	return false;
}

export function isGlueStatement(
	code: string,
	bound: ReadonlySet<string>,
): boolean {
	const print = PRINT_EXPRESSION.exec(code);
	if (print) return isOutputExpression(print[1], bound);
	const forEachPrint = FOR_EACH_PRINT.exec(code);
	if (forEachPrint) return bound.has(forEachPrint[1]);
	return isGlueLoop(code, bound);
}
