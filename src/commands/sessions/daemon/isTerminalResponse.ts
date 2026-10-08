const ESC = String.raw`\x1b`;
const ST = String.raw`(?:\x07|${ESC}\\)`;

const RESPONSE = [
	String.raw`${ESC}\[[?>=]?[\d;]*c`,
	String.raw`${ESC}\[\??[\d;]*R`,
	String.raw`${ESC}\[\??\d*n`,
	String.raw`${ESC}\[\??[\d;]*\$y`,
	String.raw`${ESC}\[[\d;]*t`,
	String.raw`${ESC}\[\?\d*u`,
	String.raw`${ESC}\[[IO]`,
	String.raw`${ESC}\][^\x07\x1b]*${ST}`,
	String.raw`${ESC}P[^\x1b]*${ESC}\\`,
].join("|");

const ONLY_RESPONSES = new RegExp(`^(?:${RESPONSE})+$`);

export function isTerminalResponse(data: string): boolean {
	return ONLY_RESPONSES.test(data);
}
