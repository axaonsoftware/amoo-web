const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const WS_URL = API_URL.replace(/^http/, "ws");

type EventHandler = (data: unknown) => void;

export function connectChatWebSocket(
  token: string,
  handlers: Record<string, EventHandler>
): { send: (data: unknown) => void; close: () => void } {
  const ws = new WebSocket(`${WS_URL}/chat?token=${token}`);

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
      // Ignore non-JSON messages (e.g. pongs).
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