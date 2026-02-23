# List threads

User opens the conversations screen (student: my requests only; counsellor: all requests, with optional filter by status).

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: openThreadList
    Client->>+API: GET /api/threads?user_id=...&status=...

    alt Missing or invalid user_id
        API-->>Client: 400 error
    else Valid user_id
        API->>DB: getUser(userId)
        DB-->>API: user

        alt User not found
            API-->>Client: 404 error
        else User found
            alt Student
                API->>DB: findThreadsByStudent(userId)
            else Counsellor
                alt Invalid status (not ALL/WAITING/REPLIED)
                    API-->>Client: 400 error
                else Valid status (or ALL/omitted)
                    API->>DB: findThreads(status?)
                end
            end

            DB-->>API: threads (newest first)
            API-->>-Client: 200 threads
            Client-->>User: showThreadList
        end
    end
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User opens the conversations list screen. |
| 2 | Client requests GET /api/threads with user_id (and optional status). API validates user_id; if missing/invalid it returns 400. |
| 3 | API loads the user from the DB; if the user does not exist it returns 404. |
| 4 | If the user is a student, API fetches only that student’s threads. If the user is a counsellor, API optionally validates status; if invalid it returns 400, otherwise it fetches threads with an optional status filter. |
| 5 | API returns the threads sorted by newest first, and the client renders the thread list. |
