import * as Ably from "ably";

let ablyClient: Ably.Realtime | null = null;

export async function getAblyClient(): Promise<Ably.Realtime | null> {
  if (ablyClient) return ablyClient;

  try {
    const statusRes = await fetch("/api/ably/status");
    const { configured } = await statusRes.json();
    
    if (!configured) {
      console.log("Ably not configured, falling back to WebSocket");
      return null;
    }

    ablyClient = new Ably.Realtime({
      authUrl: "/api/ably/auth",
      authMethod: "POST",
    });

    return ablyClient;
  } catch (error) {
    console.error("Failed to initialize Ably:", error);
    return null;
  }
}

export function getSessionChannel(sessionId: string): Ably.RealtimeChannel | null {
  if (!ablyClient) return null;
  return ablyClient.channels.get(`session:${sessionId}`);
}

export function closeAbly() {
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
  }
}
