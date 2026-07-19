import { Lexer } from "yaml";

export function collectYamlComments(
	content: string,
): { line: number; text: string }[] {
	const comments: { line: number; text: string }[] = [];
	let line = 1;

	for (const token of new Lexer().lex(content)) {
		if (token.startsWith("#")) comments.push({ line, text: token });
		for (const char of token) if (char === "\n") line++;
	}

	return comments;
}
