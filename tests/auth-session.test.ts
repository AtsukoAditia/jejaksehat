import assert from "node:assert/strict";
import test from "node:test";
import {
  requireUserId,
  UnauthorizedError,
} from "../src/application/auth/session";

test("requireUserId returns the internal UUID", () => {
  const userId = requireUserId({ user: { id: "6fe23113-9d5d-4da5-a220-00673e41f224" } });

  assert.equal(userId, "6fe23113-9d5d-4da5-a220-00673e41f224");
});

test("requireUserId rejects a missing session", () => {
  assert.throws(() => requireUserId(null), UnauthorizedError);
});

test("requireUserId rejects a session without an internal UUID", () => {
  assert.throws(() => requireUserId({ user: {} }), UnauthorizedError);
});
