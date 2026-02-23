# Create thread

Student starts a new support request by entering a topic and the first message. The system creates the thread and saves that text as the first message so the counsellor can see it.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: submitSupportRequest
    Client->>+API: createThread( studentId, topic, description )
    API->>API: validate
    API->>DB: getUser( studentId )
    DB-->>API: student
    alt Validation fail
        API-->>Client: error
    end
    API->>DB: saveThread
    API->>DB: saveFirstMessage( threadId, content )
    DB-->>API: ok
    API-->>-Client: thread
    Client-->>User: showThreadCreated
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User fills in topic and first message, then submits. |
| 2 | System checks the user is a student and the inputs are valid. |
| 3 | A new thread is created and the first message is saved. |
| 4 | User sees the new thread and can open it to continue the conversation. |
