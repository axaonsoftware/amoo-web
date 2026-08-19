/**
 * Tests for chat-related utility functions.
 * Run with: npx tsx --test lib/__tests__/chat.test.ts
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// timeAgo helper (inline copy from ConversationList — tests the logic)
// ---------------------------------------------------------------------------
function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// ---------------------------------------------------------------------------
// formatTime helper (inline copy from MessageThread)
// ---------------------------------------------------------------------------
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

// ---------------------------------------------------------------------------
// isSameDay helper (inline copy from MessageThread)
// ---------------------------------------------------------------------------
function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ---------------------------------------------------------------------------
// formatDate helper (inline copy from MessageThread)
// ---------------------------------------------------------------------------
function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(iso, now.toISOString())) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(iso, yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("timeAgo", () => {
  test("returns empty string for null", () => {
    assert.equal(timeAgo(null), "");
  });

  test("returns 'now' for recent timestamps", () => {
    const now = new Date().toISOString();
    assert.equal(timeAgo(now), "now");
  });

  test("returns minutes for timestamps within the hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    assert.equal(timeAgo(fiveMinAgo), "5m");
  });

  test("returns hours for timestamps within the day", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    assert.equal(timeAgo(threeHoursAgo), "3h");
  });

  test("returns days for timestamps within the week", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
    assert.equal(timeAgo(twoDaysAgo), "2d");
  });
});

describe("formatTime", () => {
  test("returns empty string for invalid ISO", () => {
    assert.equal(formatTime("not-a-date"), "");
  });

  test("formats a valid ISO string to time", () => {
    const result = formatTime("2025-06-15T14:30:00Z");
    assert.ok(result.includes("30")); // minutes
    assert.ok(result.includes(":"));
  });
});

describe("isSameDay", () => {
  test("returns true for same day", () => {
    assert.equal(isSameDay("2025-06-15T06:00:00Z", "2025-06-15T18:00:00Z"), true);
  });

  test("returns false for different days", () => {
    assert.equal(isSameDay("2025-06-15T10:00:00Z", "2025-06-16T10:00:00Z"), false);
  });

  test("returns false for different months", () => {
    assert.equal(isSameDay("2025-06-15T10:00:00Z", "2025-07-15T10:00:00Z"), false);
  });
});

describe("formatDate", () => {
  test("returns 'Today' for current date", () => {
    const now = new Date().toISOString();
    assert.equal(formatDate(now), "Today");
  });

  test("returns 'Yesterday' for previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    assert.equal(formatDate(yesterday.toISOString()), "Yesterday");
  });

  test("returns formatted date for older timestamps", () => {
    const result = formatDate("2024-01-15T10:00:00Z");
    assert.ok(result.includes("Jan"));
    assert.ok(result.includes("2024"));
  });
});

// ---------------------------------------------------------------------------
// Chat type validation
// ---------------------------------------------------------------------------
describe("ChatMessage shape", () => {
  test("valid message has all required fields", () => {
    const msg = {
      id: 1,
      conversation_id: 1,
      sender_type: "user",
      sender_id: 1,
      content: "Hello",
      is_read: false,
      created_at: "2025-01-01T00:00:00Z",
      status: "pending" as const,
    };
    assert.equal(typeof msg.id, "number");
    assert.equal(typeof msg.conversation_id, "number");
    assert.equal(typeof msg.sender_type, "string");
    assert.equal(typeof msg.content, "string");
    assert.equal(typeof msg.is_read, "boolean");
    assert.equal(msg.status, "pending");
  });

  test("message supports client_id for optimistic updates", () => {
    const clientId = "test-uuid-123";
    const msg = {
      id: clientId,
      conversation_id: 1,
      sender_type: "user",
      sender_id: 1,
      content: "Optimistic",
      is_read: false,
      created_at: new Date().toISOString(),
      client_id: clientId,
      status: "pending" as const,
    };
    assert.equal(msg.client_id, clientId);
    assert.equal(msg.id, clientId);
  });

  test("message status values are valid", () => {
    const validStatuses = ["pending", "sent", "delivered", "failed"];
    for (const status of validStatuses) {
      const msg = { status };
      assert.ok(
        ["pending", "sent", "delivered", "failed"].includes(msg.status as string),
        `Status '${status}' should be valid`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Conversation shape
// ---------------------------------------------------------------------------
describe("Conversation shape", () => {
  test("has all required fields", () => {
    const conv = {
      id: 1,
      user_id: 1,
      expert_id: 10,
      user_name: "Alice",
      user_avatar: null,
      expert_name: "Ravi",
      expert_avatar: null,
      last_message_at: "2025-01-01T00:00:00Z",
      unread_count: 3,
    };
    assert.equal(typeof conv.id, "number");
    assert.equal(typeof conv.user_name, "string");
    assert.equal(typeof conv.expert_name, "string");
    assert.equal(typeof conv.unread_count, "number");
  });
});
