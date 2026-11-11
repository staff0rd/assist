import { describeDatabaseUrlSource } from "./describeDatabaseUrlSource";

const CONNECTION_ERROR_CODES = new Set([
	"ENOTFOUND",
	"EAI_AGAIN",
	"ECONNREFUSED",
	"ECONNRESET",
	"ETIMEDOUT",
	"EHOSTUNREACH",
	"ENETUNREACH",
	"28P01",
	"28000",
	"3D000",
]);

type CodedError = { code?: unknown; message?: unknown };

function firstCause(error: unknown): CodedError | undefined {
	if (error instanceof AggregateError) return error.errors[0] as CodedError;
	return typeof error === "object" && error !== null
		? (error as CodedError)
		: undefined;
}

function connectionFailure(error: unknown): string | undefined {
	const cause = firstCause(error);
	const code =
		(error as CodedError | undefined)?.code ?? cause?.code ?? undefined;
	const message = String(cause?.message ?? "");
	if (typeof code === "string" && CONNECTION_ERROR_CODES.has(code))
		return message.includes(code) ? message : `${message} (${code})`;
	if (/connection timeout|timeout expired/i.test(message)) return message;
	return undefined;
}

export class DatabaseConnectionError extends Error {
	constructor(failure: string, source: string) {
		super(
			`Could not connect to the assist database: ${failure}\nThe connection string comes from ${source}.`,
		);
		this.name = "DatabaseConnectionError";
	}
}

export function toDatabaseConnectionError(error: unknown): unknown {
	if (error instanceof DatabaseConnectionError) return error;
	const failure = connectionFailure(error);
	if (!failure) return error;
	return new DatabaseConnectionError(failure, describeDatabaseUrlSource());
}
