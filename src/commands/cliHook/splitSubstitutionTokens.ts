const OPENER = /^(?:\w+=)?(?:\$\(|`|\()+/;
const CLOSER = /[)`]+$/;

export const SUBSTITUTION_CLOSE = ")";

export function splitSubstitutionTokens(tokens: string[]): string[] {
	return tokens.flatMap((token) => {
		const body = token.replace(OPENER, "");
		if (/['"]$/.test(body) || !CLOSER.test(body)) return body ? [body] : [];
		const inner = body.replace(CLOSER, "");
		return inner ? [inner, SUBSTITUTION_CLOSE] : [SUBSTITUTION_CLOSE];
	});
}
