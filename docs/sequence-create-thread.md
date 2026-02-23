# Create thread

Student starts a new support request by entering a topic and the first message. The system creates the thread and saves that text as the first message so the counsellor can see it.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant DB

    User->>Client: submitSupportRequest
    Client->>+API: POST /api/threads {student_id, topic, description}

    API->>API: validateInputs
    API->>DB: getUser(student_id)

    alt Validation error or user not found
        API-->>Client: 400/404 error
    else OK
        API->>DB: createThread(student_id, topic, status=WAITING)
        API->>DB: createFirstMessage(thread_id, student_id, description)
        API->>DB: commit
        API-->>-Client: 201 thread
        Client-->>User: showThreadCreated
    end
```

## Flow

| Step | What happens |
|------|----------------|
| 1 | User(Student) submits topic and the first message. |
| 2 | API validates inputs and confirms the user exists and is a student (otherwise returns 400/404). |
| 3 | API creates the thread and saves the first message, then returns 201 with the created thread. |
| 4 | Client shows the created thread screen. |
