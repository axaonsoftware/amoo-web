// WebSocket connects directly to backend (not through Next.js rewrites).
// In production nginx proxies /chat to the backend on the same origin,
// so the browser sends the httpOnly access_token cookie automatically.
// In development set NEXT_PUBLIC_API_URL to match the backend origin.
const WS_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/^http/, "ws");

type EventHandler = (data: unknown) => void;

export interface WsHandle {
  send: (data: unknown) => void;
  close: () => void;
}

/**
 * Open a chat WebSocket connection.
 *
 * @param handlers  Map of message `type` to handler.  Special keys:
 *                  `onOpen`, `onError`, `onClose` are called on lifecycle events.
 * @param token     Optional JWT.  If omitted the browser cookie is used.
 */
export function connectChatWebSocket(
  handlers: Record<string, EventHandler>,
  token?: string,
): WsHandle {
  const url = `${WS_URL}/chat`;

  // Pass the JWT via Sec-WebSocket-Protocol header instead of URL query string
  // to avoid leaking the token in server logs, browser history, and Referer.
  const protocols = token ? [token] : [];
  const ws = new WebSocket(url, protocols);

  ws.onopen = () => {
    handlers.onOpen?.(null);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const handler = handlers[data.type];
      if (handler) {
        handler(data);
      }
    } catch {
      // Ignore non-JSON messages.
    }
  };

  ws.onerror = () => {
    handlers.onError?.(null);
  };

  ws.onclose = (event) => {
    handlers.onClose?.({ code: event.code, reason: event.reason });
  };

  return {
    send: (data: unknown) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },
    close: () => {
      ws.close();
    },
  };
}
