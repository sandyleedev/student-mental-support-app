# Get thread detail

User opens a thread to see the full conversation. The screen shows the thread and all messages in order.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: openThread
    Client->>+API: getThread( threadId )
    API->>DB: getThread( threadId )
    DB-->>API: thread
    alt Thread not found
        API-->>Client: error
    end
    API->>DB: getMessages( threadId )
    DB-->>API: messages
    API-->>-Client: thread, messages
    Client-->>User: showChat
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User taps a thread in the list. |
| 2 | System loads the thread and its messages in order. |
| 3 | User sees the full conversation and can send a new message. |
