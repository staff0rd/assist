import { describe, expect, it } from "vitest";
import { createOrderGuard } from "./createOrderGuard";

describe("createOrderGuard", () => {
	it("accepts a fetch when no move happened during it", () => {
		const guard = createOrderGuard();
		const isFresh = guard.ticket();
		expect(isFresh()).toBe(true);
	});

	it("rejects a fetch while a move is pending", () => {
		const guard = createOrderGuard();
		guard.hold();
		expect(guard.ticket()()).toBe(false);
	});

	it("rejects a fetch that started before a move settled", () => {
		const guard = createOrderGuard();
		const release = guard.hold();
		const isFresh = guard.ticket();
		release();
		expect(isFresh()).toBe(false);
		expect(guard.ticket()()).toBe(true);
	});

	it("rejects a fetch that started before a move began", () => {
		const guard = createOrderGuard();
		const isFresh = guard.ticket();
		guard.hold()();
		expect(isFresh()).toBe(false);
	});

	it("ignores a repeated release", () => {
		const guard = createOrderGuard();
		const release = guard.hold();
		guard.hold();
		release();
		release();
		expect(guard.ticket()()).toBe(false);
	});
});
