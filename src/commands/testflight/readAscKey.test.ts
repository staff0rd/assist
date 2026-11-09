import { describe, expect, it } from "vitest";
import { cleanOpStderr } from "./cleanOpStderr";
import { readAscKey } from "./readAscKey";
import type { OpResult, OpRunner } from "./runOp";

const ref = "op://Private/Key/AuthKey.p8";
const missing: OpResult = {
	ok: false,
	error: `"Key" isn't an item in the "Private" vault.`,
	missing: true,
};
const accounts: OpResult = {
	ok: true,
	stdout: JSON.stringify([
		{ url: "makerx.1password.com" },
		{ url: "my.1password.com" },
	]),
};

function fakeOp(respond: (args: string[]) => OpResult) {
	const calls: string[][] = [];
	const op: OpRunner = async (args) => {
		calls.push(args);
		return respond(args);
	};
	return { op, calls };
}

describe("readAscKey", () => {
	it("reads from the default account when it holds the item", async () => {
		const { op, calls } = fakeOp(() => ({ ok: true, stdout: "pem\n" }));
		expect(await readAscKey(ref, op)).toBe("pem");
		expect(calls).toEqual([["read", ref]]);
	});

	it("searches each signed-in account when the default lacks the item", async () => {
		const { op, calls } = fakeOp((args) => {
			if (args[0] === "account") return accounts;
			return args.includes("my.1password.com")
				? { ok: true, stdout: "pem" }
				: missing;
		});
		expect(await readAscKey(ref, op)).toBe("pem");
		expect(calls.at(-1)).toEqual([
			"read",
			"--account",
			"my.1password.com",
			ref,
		]);
	});

	it("names the missing item and the accounts searched", async () => {
		const { op } = fakeOp((args) =>
			args[0] === "account" ? accounts : missing,
		);
		const error = readAscKey(ref, op);
		await expect(error).rejects.toThrow(/isn't an item in the "Private" vault/);
		await expect(error).rejects.toThrow(
			/searched makerx\.1password\.com, my\.1password\.com/,
		);
		await expect(error).rejects.not.toThrow(/installed/);
	});

	it("does not search other accounts for a non-missing error", async () => {
		const { op, calls } = fakeOp(() => ({
			ok: false,
			error: "not signed in",
			missing: false,
		}));
		await expect(readAscKey(ref, op)).rejects.toThrow(/not signed in/);
		expect(calls).toHaveLength(1);
	});
});

describe("cleanOpStderr", () => {
	it("drops the WSL op wrapper's CMD.EXE/UNC lines", () => {
		const stderr = [
			String.raw`'\\wsl.localhost\Ubuntu-22.04\home\stafford\git'`,
			"CMD.EXE was started with the above path as the current directory.",
			"UNC paths are not supported.  Defaulting to Windows directory.",
			"[ERROR] could not read secret",
		].join("\r\n");
		expect(cleanOpStderr(stderr)).toBe("[ERROR] could not read secret");
	});
});
