---
name: realtime-chat-flow
description: Work on the buyer-seller real-time chat system (chatting-service) — the WebSocket server, presence tracking, unseen counts, or the Kafka-backed message persistence pipeline. Use when the user asks to change chat, messaging, online-status, or notification-count behavior.
---

# Realtime Chat Flow (EcommerceShop)

Owned by `apps/chatting-service`. This is not a typical REST CRUD service — it's a WebSocket server plus a Kafka producer/consumer pair, with a REST layer only for reading chat history.

## Pieces

- [websocket.ts](../../../apps/chatting-service/src/websocket.ts) — the `ws` WebSocketServer attached to the service's HTTP server. Handles connection registration, message routing, presence, and unseen counts. **In-memory only** (`connectedUsers`/`unSeenCounts` are `Map`s in process memory — they reset on restart and don't survive multiple service instances; keep this in mind before scaling this service horizontally without adding shared state).
- [chat-message.consumer.ts](../../../apps/chatting-service/src/chat-message.consumer.ts) — Kafka consumer on topic `chat.new_message`, batches incoming messages in memory and flushes to MongoDB via Prisma every `BATCH_INTERVAL_MS` (3s) or lets a failed flush retry by re-queueing the buffer.
- `controllers/chatting.controller.ts` + `routes/chat.routes.ts` — REST endpoints for chat history/conversations.

## Connection & message protocol

1. Client connects to the WebSocket, then sends a **first plain-text (non-JSON) message** containing its own id to register — `"seller_<id>"` or a plain user id. This sets presence in Redis (`online:seller:<id>` / `online:user:<id>`).
2. All messages after that are JSON. Two message shapes matter:
   - Regular chat message: `{ fromUserId, toUserId, messageBody, conversationId, senderType }`
   - `{ type: "MARK_AS_SEEN", conversationId }` — resets the unseen counter for that conversation.
3. On a regular message, the server: looks up the receiver's live socket by `seller_<id>`/`user_<id>` key, sends `NEW_MESSAGE` + `UNSEEN_COUNT_UPDATE` events to the receiver if online, echoes `NEW_MESSAGE` back to the sender, and always pushes the message to Kafka topic `chat.new_message` for durable persistence (delivery over the socket is best-effort/online-only; persistence always happens via Kafka).
4. On disconnect, the presence Redis key is deleted.

**When adding a new message type**, extend the `IncomingMessage`/event `type` discriminant in `websocket.ts` rather than adding a new endpoint — the whole protocol is one socket connection per user.

## Persistence path

`websocket.ts` never writes to Prisma directly — it only produces to Kafka. `chat-message.consumer.ts` is the sole writer to the `Message` table, batching for write efficiency. If you need messages to be queryable immediately after send, remember there's up to `BATCH_INTERVAL_MS` (3s) of consumer-side buffering before they land in MongoDB — the REST history endpoints will lag by that much.

## Verify

Use `run-app` to serve `chatting-service` (needs Redis + Kafka + MongoDB reachable) plus `api-gateway` and the relevant UI(s) (`user-ui` buyer inbox, `seller-ui` customer chat). Open two browser sessions (or two tabs, one per role) to exercise both sides of a conversation and confirm presence/unseen-count updates.
