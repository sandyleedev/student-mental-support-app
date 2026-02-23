# Create thread

Student starts a new support request by entering a topic and the first message. The system creates the thread and saves that text as the first message so the counsellor can see it.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>+Client: submitSupportRequest
    Client->>+API: createThread
    API->>API: validateInputs
    API->>+DB: getUser
    DB-->>API: student

    alt Validation error or user not found
        API-->>Client: 400 or 404 error
        Client-->>User: showError
    else OK
        API->>DB: createThread createFirstMessage commit
        DB-->>-API: ok
        API-->>-Client: 201 thread
        Client-->>-User: showThreadCreated
    end
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User submits topic and the first message. |
| 2 | API validates inputs and confirms the user exists and is a student (otherwise returns 400/404). |
| 3 | API creates the thread and saves the first message, then returns 201 with the created thread. |
| 4 | Client shows the created thread screen. |
