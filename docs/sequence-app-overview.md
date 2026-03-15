# Campus Compass — Flow overview

Campus Compass lets students request support and counsellors respond. Below is how the main flows fit together; each flow has its own sequence diagram.

## Who uses the app

| Role | What they do |
|------|----------------|
| Student | Starts support requests (topic + first message), sees only their own threads, sends messages only in their threads. |
| Counsellor | Sees all threads (optionally filter by status), opens any thread, replies with messages. |

## Main flows

| Flow | What it does |
|------|----------------|
| [List threads](sequence-list-threads.md) | User opens the list: students see their requests, counsellors see the queue. |
| [Create thread](sequence-create-thread.md) | Student starts a new request with a topic and first message. |
| [Get thread detail](sequence-get-thread.md) | User opens a thread and sees the full conversation. |
| [Send message](sequence-send-message.md) | User sends a message in the thread; students only in their own thread. |

## Sequence diagrams by flow

1. [List threads](sequence-list-threads.md)
2. [Create thread](sequence-create-thread.md)
3. [Get thread detail](sequence-get-thread.md)
4. [Send message](sequence-send-message.md)
