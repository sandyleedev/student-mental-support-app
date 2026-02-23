# List threads

User opens the conversations screen (student: my requests only; counsellor: all requests, with optional filter by status).

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: openConversations
    Client->>+API: listThreads( userId, status )
    API->>API: resolveUser
    API->>DB: getUser( userId )
    DB-->>API: user
    alt User not found
        API-->>Client: error
    end
    alt Student
        API->>DB: findThreadsByStudent( userId )
    else Counsellor
        API->>DB: findThreads( status )
    end
    DB-->>API: threads
    API-->>-Client: threads
    Client-->>User: showThreadList
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User opens the list (students see their own requests; counsellors see the queue). |
| 2 | System loads the user and fetches the right threads. |
| 3 | List is shown, newest first; counsellors can filter by waiting or replied. |
