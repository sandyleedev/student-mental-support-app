# Send messages in a thread

This diagram focuses on the messaging flow after a thread has been opened. It shows the conversation update at a high level without low-level validation or transport details.

```mermaid
sequenceDiagram
    participant User
    participant threadView as ":ThreadView"
    participant threadHandler as ":ThreadHandler"
    participant threadRepository as ":ThreadRepository"

    User->>+threadView: Send message
    threadView->>+threadHandler: Submit message
    threadHandler->>+threadRepository: Load thread context
    threadRepository-->>-threadHandler: Current thread state
    threadHandler->>+threadRepository: Save message and update thread status
    threadRepository-->>-threadHandler: Updated conversation state
    threadHandler-->>-threadView: Return new message state
    threadView-->>-User: Show updated conversation
```

## Covered flow

| Flow | What it shows |
|------|----------------|
| Exchange messages | A user sends a message in an existing thread, the conversation is updated, and the latest state is shown in the chat view. |
