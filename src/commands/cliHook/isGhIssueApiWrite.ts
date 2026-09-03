import { extractGhApiMethod } from "../../shared/extractGhApiMethod";
import { tokenize } from "../../shared/tokenize";

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const BODY_FLAGS = ["-f", "-F", "--field", "--raw-field", "--input"];
const COMMAND_OPERATORS = new Set(["&&", "||", ";", "|", "&"]);
const ISSUE_ENDPOINT =
	/(?:^|[/"'`])repos\/[^/\s"'`]+\/[^/\s"'`]+\/issues(?:$|[/?"'`])/;

export function isGhIssueApiWrite(command: string): boolean {
	const tokens = tokenize(command);

	for (let i = 0; i + 1 < tokens.length; i++) {
		if (tokens[i] !== "gh" || tokens[i + 1] !== "api") continue;
		const args = argsUntilNextCommand(tokens.slice(i + 2));
		if (targetsIssueEndpoint(args) && isWrite(args)) return true;
	}

	return false;
}

function argsUntilNextCommand(tokens: string[]): string[] {
	const end = tokens.findIndex((token) => COMMAND_OPERATORS.has(token));
	return end === -1 ? tokens : tokens.slice(0, end);
}

function targetsIssueEndpoint(args: string[]): boolean {
	return args.some((arg) => ISSUE_ENDPOINT.test(arg));
}

function isWrite(args: string[]): boolean {
	const method = extractGhApiMethod(args);
	if (method) return WRITE_METHODS.has(unquote(method).toUpperCase());
	return args.some(isBodyFlag);
}

function isBodyFlag(arg: string): boolean {
	return BODY_FLAGS.some(
		(flag) =>
			arg === flag ||
			arg.startsWith(`${flag}=`) ||
			(flag.length === 2 && arg.length > 2 && arg.startsWith(flag)),
	);
}

function unquote(value: string): string {
	return value.replace(/^['"]|['"]$/g, "");
}
