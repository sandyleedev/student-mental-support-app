# List threads

User opens the conversations screen (student: my requests only; counsellor: all requests, with optional filter by status).

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: openConversations
    Client->>+API: GET /api/threads?user_id=...&status=...

    API->>API: validateInputs
    API->>DB: getUser(user_id)

    alt Validation error or user not found
        API-->>Client: 400/404 error
    else OK
        alt Student
            API->>DB: findThreadsByStudent(user_id)
        else Counsellor
            API->>DB: findThreads(status?)
        end
        DB-->>API: threads (newest first)
        API-->>-Client: 200 threads
        Client-->>User: showThreadList
    end
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User opens the conversations list screen. |
| 2 | API validates inputs and loads the user (otherwise returns 400/404). |
| 3 | API fetches threads based on role (student: own only; counsellor: all with optional status filter), sorted newest first. |
| 4 | Client displays the thread list. |
