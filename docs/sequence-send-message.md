# Send message

User writes a message and sends it in the thread. Students can only send in their own threads; counsellors can reply in any thread. The thread status (e.g. waiting for reply) is updated accordingly.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: sendMessage
    Client->>+API: addMessage( threadId, senderId, content )
    API->>API: validate
    API->>DB: getThread( threadId )
    DB-->>API: thread
    alt Thread not found
        API-->>Client: error
    end
    API->>DB: getSender( senderId )
    DB-->>API: sender
    alt Sender not found or not allowed
        API-->>Client: error
    end
    alt Student sending in another thread
        API-->>Client: forbidden
    end
    API->>DB: saveMessage, updateThreadStatus
    DB-->>API: ok
    API-->>-Client: message
    Client-->>User: showMessageInChat
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User types a message and sends. |
| 2 | System checks the thread exists and the sender can post (students only in their own thread). |
| 3 | The message is saved and the thread status is updated (e.g. waiting for counsellor reply). |
| 4 | The new message appears in the chat. |
