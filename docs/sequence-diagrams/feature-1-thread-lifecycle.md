# Support thread lifecycle

This diagram combines the main thread management flows into one high-level view: starting a support request, browsing threads, and opening a conversation.

```mermaid
sequenceDiagram
    participant User
    participant threadView as ":ThreadView"
    participant threadHandler as ":ThreadHandler"
    participant threadRepository as ":ThreadRepository"

    %% Flow 1 - Start a support request
    User->>+threadView: Submit topic, urgency level, and first message
    threadView->>+threadHandler: Create thread
    threadHandler->>+threadRepository: Save thread, urgency level, and first message
    threadRepository-->>-threadHandler: Created thread
    threadHandler-->>-threadView: Return new thread
    threadView-->>-User: Show created conversation

    %% Flow 2 - Browse support threads
    User->>+threadView: Open thread list
    threadView->>+threadHandler: Request available threads
    alt student
        threadHandler->>+threadRepository: Load the student's thread list
        threadRepository-->>-threadHandler: Student threads
    else counsellor
        threadHandler->>+threadRepository: Load all students' threads
        threadRepository-->>-threadHandler: All threads
    end
    threadHandler-->>-threadView: Return thread list
    threadView-->>-User: Show thread list

    %% Flow 3 - Open a conversation
    User->>+threadView: Select a thread
    threadView->>+threadHandler: Request thread details
    threadHandler->>+threadRepository: Load thread and messages
    threadRepository-->>-threadHandler: Conversation data
    threadHandler-->>-threadView: Return conversation
    threadView-->>-User: Show thread details
```

## Covered flows

| Flow | What it shows |
|------|----------------|
| Start a support request | A student creates a thread with a selected urgency level, and the first message is stored as part of the new conversation. |
| Browse threads | The system returns the relevant thread list for the current user view. |
| Open a conversation | The client loads the selected thread together with its message history. |
