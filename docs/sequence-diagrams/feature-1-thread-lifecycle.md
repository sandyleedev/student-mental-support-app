# Support thread lifecycle

The support thread lifecycle: a client-side urgency check-in precedes thread creation, where high urgency triggers crisis-style guidance before submission. The student then submits a topic and initial message, and the backend creates a thread with an associated urgency level. After creation, access is role-based: students may view and open only their own threads, while counsellors may access all threads.

```mermaid
sequenceDiagram
    participant Student
    participant Counsellor
    participant screeningView as ":UrgencyScreeningView"
    participant supportView as ":SupportRequestView"
    participant threadView as ":ThreadView"
    participant threadHandler as ":ThreadHandler"
    participant threadRepository as ":ThreadRepository"

    Student->>+screeningView: Complete questions, submit
    alt Highest concern
        screeningView-->>Student: Show crisis support numbers and next steps
        Student->>screeningView: Continue to the support request
    else Medium or lower concern
        Note over screeningView: Go to the support request
    end
    screeningView-->>supportView: Pass the urgency into the form step
    Student->>+supportView: Add topic, message, send
    supportView->>+threadHandler: createThread(studentId, payload)
    threadHandler->>+threadRepository: saveNewThreadForStudent(studentId, topic, urgency, firstMessage)
    threadRepository-->>-threadHandler: created thread
    threadHandler-->>-supportView: return new thread
    supportView-->>-Student: show created conversation or confirmation

    alt Student lists own threads
        Student->>+threadView: Open thread list
        Note over Student, threadView: Own threads only
        threadView->>+threadHandler: getOwnThreads(studentId)
        threadHandler->>+threadRepository: findThreadsByStudentId(studentId)
        threadRepository-->>-threadHandler: Threads for that student only
        threadHandler-->>-threadView: Return own thread list
        threadView-->>-Student: Show thread list
    else Counsellor lists all threads
        Counsellor->>+threadView: Open thread list
        Note over Counsellor, threadView: All threads
        threadView->>+threadHandler: getAllThreads()
        threadHandler->>+threadRepository: findAllThreads()
        threadRepository-->>-threadHandler: All students' threads
        threadHandler-->>-threadView: Return full thread list
        threadView-->>-Counsellor: Show thread list
    end

    alt Student opens a thread
        Student->>+threadView: Select thread
        threadView->>+threadHandler: getThreadForStudent(studentId, threadId)
        threadHandler->>+threadRepository: findThreadByIdAndStudentId(threadId, studentId)
        threadRepository-->>-threadHandler: Thread and messages (or not found if not owned)
        threadHandler-->>-threadView: Conversation data
        threadView-->>-Student: Show thread details
    else Counsellor opens a thread
        Counsellor->>+threadView: Select thread
        threadView->>+threadHandler: getThreadForCounsellor(threadId)
        threadHandler->>+threadRepository: findThreadByIdWithMessages(threadId)
        threadRepository-->>-threadHandler: Thread and messages
        threadHandler-->>-threadView: Conversation data
        threadView-->>-Counsellor: Show thread details
    end
```

## Covered flows

| Flow                     | What it shows                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Check-in and new request | A short check-in; optional crisis information at the **highest** level; then **createThread** / **saveNewThreadForStudent** with topic, urgency, and first message. |
| Browse threads           | **getOwnThreads** for a student; **getAllThreads** for a counsellor.                                                                                                |
| Open a conversation      | **getThreadForStudent** scopes by `studentId`; **getThreadForCounsellor** loads by thread id.                                                                       |
| Team visibility          | After a case exists, the team **sees urgency** in the list or chat when they work the app; **no** automatic text or email from the check-in flow.                   |
