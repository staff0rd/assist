import { describe, expect, it } from "vitest";
import { createSdkInput } from "./createSdkInput";

describe("createSdkInput", () => {
	it("yields pushed messages as user turns and ends when closed", async () => {
		const input = createSdkInput();
		input.push("first");
		const iterator = input.messages[Symbol.asyncIterator]();
		const first = await iterator.next();
		expect(first.value).toEqual({
			type: "user",
			message: { role: "user", content: "first" },
			parent_tool_use_id: null,
		});
		const pending = iterator.next();
		input.push("second");
		expect((await pending).value?.message.content).toBe("second");
		const end = iterator.next();
		input.close();
		expect((await end).done).toBe(true);
	});
});
