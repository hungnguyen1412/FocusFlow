import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../timer-engine.js", import.meta.url), "utf8");
const context = { console, globalThis: {} };
context.globalThis = context;
vm.runInNewContext(source, context);
const engine = context.FocusFlowTimer;

test("selects short and long breaks at the configured interval", () => {
  assert.equal(engine.getNextPhase("focus", 1, 4), "shortBreak");
  assert.equal(engine.getNextPhase("focus", 4, 4), "longBreak");
  assert.equal(engine.getNextPhase("shortBreak", 4, 4), "focus");
  assert.equal(engine.getNextPhase("longBreak", 4, 4), "focus");
});

test("creates a stable local day key", () => {
  assert.equal(engine.getDayKey(new Date(2026, 9, 7, 23, 59)), "2026-10-07");
});

test("creates empty daily statistics with the expected counters", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(engine.emptyDailyStats("2026-10-07"))), {
    date: "2026-10-07",
    focusCompleted: 0,
    shortBreakCompleted: 0,
    longBreakCompleted: 0,
    focusDurationMs: 0,
    skippedFocus: 0,
    skippedShortBreak: 0,
    skippedLongBreak: 0,
  });
});

test("aggregates history for a range", () => {
  const result = engine.aggregateStats({
    "2026-10-06": { focusCompleted: 3, shortBreakCompleted: 2, longBreakCompleted: 1, focusDurationMs: 4500 },
    "2026-10-07": { focusCompleted: 4, shortBreakCompleted: 3, longBreakCompleted: 1, focusDurationMs: 6000 },
  }, ["2026-10-06", "2026-10-07"]);

  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    focusCompleted: 7,
    shortBreakCompleted: 5,
    longBreakCompleted: 2,
    focusDurationMs: 10500,
  });
});

test("calculates a goal-based consecutive-day streak", () => {
  const history = {
    "2026-10-04": { focusCompleted: 4 },
    "2026-10-05": { focusCompleted: 4 },
    "2026-10-06": { focusCompleted: 2 },
    "2026-10-07": { focusCompleted: 4 },
  };

  assert.equal(engine.calculateStreak(history, "2026-10-07", 4), 1);
  assert.equal(engine.calculateStreak(history, "2026-10-06", 4), 2);
});
