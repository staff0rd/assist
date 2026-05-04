import { describe, expect, it } from "vitest";
import { isMutation } from "./isMutation";

describe("isMutation", () => {
	it("returns false for SELECT", () => {
		expect(isMutation("SELECT * FROM users")).toBe(false);
	});

	it("returns false for SELECT with WHERE", () => {
		expect(isMutation("SELECT id, name FROM users WHERE id = 1")).toBe(false);
	});

	it("returns true for INSERT", () => {
		expect(isMutation("INSERT INTO users (name) VALUES ('a')")).toBe(true);
	});

	it("returns true for UPDATE", () => {
		expect(isMutation("UPDATE users SET name = 'a'")).toBe(true);
	});

	it("returns true for DELETE", () => {
		expect(isMutation("DELETE FROM users WHERE id = 1")).toBe(true);
	});

	it("returns true for DROP", () => {
		expect(isMutation("DROP TABLE users")).toBe(true);
	});

	it("returns true for CREATE", () => {
		expect(isMutation("CREATE TABLE users (id int)")).toBe(true);
	});

	it("returns true for ALTER", () => {
		expect(isMutation("ALTER TABLE users ADD col int")).toBe(true);
	});

	it("returns true for TRUNCATE", () => {
		expect(isMutation("TRUNCATE TABLE users")).toBe(true);
	});

	it("returns true for EXEC", () => {
		expect(isMutation("EXEC sp_who")).toBe(true);
	});

	it("returns true for SELECT INTO", () => {
		expect(isMutation("SELECT * INTO new_users FROM users")).toBe(true);
	});

	it("is case-insensitive", () => {
		expect(isMutation("delete from users")).toBe(true);
	});

	it("ignores keywords inside line comments", () => {
		expect(isMutation("SELECT * FROM users -- DELETE me")).toBe(false);
	});

	it("ignores keywords inside block comments", () => {
		expect(isMutation("SELECT * FROM users /* DROP TABLE x */")).toBe(false);
	});

	it("returns true when mutation follows a SELECT", () => {
		expect(isMutation("SELECT 1; DELETE FROM users")).toBe(true);
	});
});
