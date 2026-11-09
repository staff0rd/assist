import type { ConnectorRunResult, RunUsage } from "./types";

type ResultLine = {
	is_error?: boolean;
	result?: string;
	structured_output?: unknown;
};

export function parseClaudeResultLine(line: string): ResultLine {
	return JSON.parse(line) as ResultLine;
}

export function claudeConnectorResult(
	result: ResultLine | undefined,
	failure: string,
	usage: RunUsage,
): ConnectorRunResult {
	if (!result) throw new Error(failure);
	if (result.is_error) throw new Error(result.result ?? "unknown error");
	return { output: result.structured_output, usage };
}
