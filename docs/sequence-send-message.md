# Send message

User writes a message and sends it in the thread. Students can only send in their own threads; counsellors can reply in any thread. The thread status (e.g. waiting for reply) is updated accordingly.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>+Client: sendMessage
    Client->>+API: addMessage
    API->>API: validateInputs

    alt Invalid sender_id or content
        API-->>Client: 400 error
        Client-->>User: showError
    else Valid inputs
        API->>+DB: getThread
        DB-->>API: thread
        API->>DB: getUser
        DB-->>API: sender
        alt Thread or sender not found
            API-->>Client: 404 error
            Client-->>User: showError
        else Found
            alt Student sending in another thread
                API-->>Client: 403 error
                Client-->>User: showError
            else Allowed
                API->>DB: createMessage updateThreadStatus commit
                DB-->>-API: ok
                API-->>-Client: 201 message
                Client-->>-User: showMessageInChat
            end
        end
    end
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User submits a message in a thread. Client calls POST /api/threads/{thread_id}/messages with sender_id and content. |
| 2 | API validates inputs (missing/invalid sender_id or empty content returns 400). |
| 3 | API checks the thread and sender exist (missing thread or sender returns 404) and enforces permissions (student can only post in their own thread, otherwise 403). |
| 4 | If allowed, the API saves the message, updates the thread status (WAITING if the sender is a student, otherwise REPLIED), commits, and returns 201 with the created message. |
| 5 | Client renders the new message in the chat. |
