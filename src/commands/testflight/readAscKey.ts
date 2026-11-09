import { TestflightError } from "./TestflightError";
import { type OpRunner, runOp } from "./runOp";

async function listAccounts(op: OpRunner): Promise<string[]> {
	const result = await op(["account", "list", "--format", "json"]);
	if (!result.ok) return [];
	const accounts = JSON.parse(result.stdout) as { url: string }[];
	return accounts.map((account) => account.url);
}

function failure(reason: string): TestflightError {
	return new TestflightError(
		`Failed to read testflight.keyRef from 1Password: ${reason}`,
	);
}

export async function readAscKey(
	reference: string,
	account?: string,
	op: OpRunner = runOp,
): Promise<string> {
	if (!reference.startsWith("op://"))
		throw new TestflightError(
			"testflight.keyRef must be a 1Password reference starting with op://",
		);
	const accountArgs = account ? ["--account", account] : [];
	const first = await op(["read", ...accountArgs, reference]);
	if (first.ok) return first.stdout.trim();
	if (account || !first.missing) throw failure(first.error);

	const accounts = await listAccounts(op);
	for (const url of accounts) {
		const result = await op(["read", "--account", url, reference]);
		if (result.ok) return result.stdout.trim();
		if (!result.missing) throw failure(`${url}: ${result.error}`);
	}
	const searched = accounts.length ? ` (searched ${accounts.join(", ")})` : "";
	throw failure(
		`${first.error}\nThe item was not found in any signed-in 1Password account${searched}. Set the account holding it with: assist config set testflight.account <account>`,
	);
}
