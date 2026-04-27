# Send messages in a thread

After a thread is opened, the **send** path: **students** are rejected unless the thread is theirs (`thread.student_id` must match the sender), while **counsellors** are not subject to a per-thread ownership check—the handler only ensures the thread and sender exist and the sender is a COUNSELLOR.

```mermaid
sequenceDiagram
    participant Student
    participant Counsellor
    participant threadView as ":ThreadView"
    participant threadHandler as ":ThreadHandler"
    participant threadRepository as ":ThreadRepository"
    participant messageRepository as ":MessageRepository"

    alt Student sends message
        Student->>+threadView: Send message
        threadView->>+threadHandler: submitMessage(threadId, userId, role, body)
        threadHandler->>+threadRepository: assertStudentOwnsThread(threadId, userId)
        Note right of threadRepository: Reject if this thread belongs to another student
        threadRepository-->>-threadHandler: OK / access denied
        threadHandler->>+messageRepository: saveMessage(threadId, senderId, body)
        messageRepository-->>-threadHandler: Persisted message
        threadHandler->>+threadRepository: updateThreadStatusFromLastSender(threadId)
        threadRepository-->>-threadHandler: Updated thread state
        threadHandler-->>-threadView: Return new conversation state
        threadView-->>-Student: Show updated conversation
    else Counsellor sends message
        Counsellor->>+threadView: Send message
        threadView->>+threadHandler: submitMessage(threadId, userId, role, body)
        threadHandler->>+threadRepository: getThreadById(threadId)
        Note right of threadRepository: No per-thread ownership check; COUNSELLOR can reply to any thread
        threadRepository-->>-threadHandler: Thread or not found
        threadHandler->>+messageRepository: saveMessage(threadId, senderId, body)
        messageRepository-->>-threadHandler: Persisted message
        threadHandler->>+threadRepository: updateThreadStatusFromLastSender(threadId)
        threadRepository-->>-threadHandler: Updated thread state
        threadHandler-->>-threadView: Return new conversation state
        threadView-->>-Counsellor: Show updated conversation
    end
```

## Covered flows

| Flow                      | What it shows                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send message (student)    | **assertStudentOwnsThread** blocks sending when the thread belongs to another student; then **MessageRepository** and thread status (e.g. WAITING). |
| Send message (counsellor) | **getThreadById** only; no ownership gate. **MessageRepository** and thread status (e.g. REPLIED).                                                  |
