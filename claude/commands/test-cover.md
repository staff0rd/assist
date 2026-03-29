---
description: Incrementally increase test coverage by identifying and testing uncovered files
allowed_args: "[number of files to cover, default 1]"
---

You are increasing test coverage for this project. Your goal is to pick the highest-value uncovered file(s) and write thorough tests for them.

## Step 1: Measure current coverage

Run coverage against all source files to identify what is untested:

```
npx vitest run --coverage --coverage.include='src/**/*.ts' --coverage.all --coverage.reporter=json 2>&1
```

Read the JSON coverage report at `coverage/coverage-final.json` to get per-file statement coverage percentages. Identify files with 0% or low coverage.

## Step 2: Prioritise files

From the uncovered files, prioritise by:

1. **Pure logic** — functions with clear inputs/outputs, no side effects (parsers, validators, transformers)
2. **Shared utilities** — files under `src/shared/` used by multiple consumers
3. **Complexity** — files with branching logic, edge cases, or error handling

Skip files that are primarily:
- Thin CLI wrappers (just parse args and call another function)
- UI components (React/TSX)
- Files that only re-export or wire things together

Select the number of files specified by `$ARGUMENTS` (default: 1).

## Step 3: Read the source and existing tests

Read each selected source file thoroughly. Also read any existing test files nearby to understand the project's testing patterns.

## Step 4: Write tests

Create a test file colocated with the source file, named `<source>.test.ts`.

Follow these conventions exactly:

- Import from `vitest`: `import { describe, expect, it } from "vitest";` (add `vi` only if mocking)
- Use Vitest's native `expect()` — no external assertion libraries
- Define helper functions locally in the test file when needed (e.g., factory functions for test data)
- Mock dependencies with `vi.mock()` only when necessary — prefer real implementations

### BDD structure

Use a behavioural, BDD-style structure:

- **Outer `describe`** — the function or module under test
- **Inner `describe("when ...")`** — groups tests that share the same setup/scenario
- **`it("should ...")`** — asserts a single rule or behaviour

Each test follows an **Arrange, Act, Assert** pattern. Do NOT add `// arrange`, `// act`, `// assert` comments — just structure the code in that order with whitespace separating the three sections.

Keep assertions per test to a minimum — ideally one, at most two closely related assertions. If you need to assert multiple things about the same action, split them into separate `it` blocks under the same `describe("when ...")`.

Example:

```typescript
describe("parseToken", () => {
  describe("when given a valid token", () => {
    it("should return the decoded payload", () => {
      const token = createToken({ sub: "user-1" });

      const result = parseToken(token);

      expect(result.sub).toBe("user-1");
    });
  });

  describe("when given an expired token", () => {
    it("should throw an expiration error", () => {
      const token = createToken({ exp: pastDate() });

      expect(() => parseToken(token)).toThrow("expired");
    });
  });
});
```

### Coverage targets

Cover:
- Happy path for each exported function
- Edge cases (empty input, undefined, boundary values)
- Error cases and invalid input
- Branch coverage — ensure each conditional path is exercised

## Step 5: Run and verify

Run the tests to confirm they pass:

```
npx vitest run <test-file-path> 2>&1
```

If any tests fail, fix them. Then re-run coverage to confirm the file now has >90% statement coverage:

```
npx vitest run --coverage --coverage.include='<source-file-path>' 2>&1
```

## Step 6: Run /verify

Run `/verify` to ensure nothing is broken.

## Step 7: Report

Show a before/after summary:

```
File                    | Before | After
<file path>             | 0%     | 95%
```

And the new repo-wide coverage number.
