import { describe, expect, it } from "vitest";
import { createSdkInput } from "./createSdkInput";

describe("createSdkInput", () => {
	it("yields pushed messages in order and ends when closed", async () => {
		const input = createSdkInput();
		input.push("first");
		const iterator = input.messages[Symbol.asyncIterator]();
		expect((await iterator.next()).value).toBe("first");
		const pending = iterator.next();
		input.push("second");
		expect((await pending).value).toBe("second");
		const end = iterator.next();
		input.close();
		expect((await end).done).toBe(true);
	});
});
