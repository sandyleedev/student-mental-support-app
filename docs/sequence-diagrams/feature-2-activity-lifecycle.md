# Activity management lifecycle

This diagram combines the main activity management flows into one high-level view: browsing activities, creating or updating an activity, and removing an activity.

```mermaid
sequenceDiagram
    participant User
    participant activityView as ":ActivityView"
    participant activityHandler as ":ActivityHandler"
    participant activityRepository as ":ActivityRepository"

    %% Flow 1 - Browse activities
    User->>+activityView: Open activity dashboard
    activityView->>+activityHandler: Request activities
    activityHandler->>+activityRepository: Load activities
    activityRepository-->>-activityHandler: Activity list
    activityHandler-->>-activityView: Return activities
    activityView-->>-User: Show activity list

    %% Flow 2 - Create or update an activity
    User->>+activityView: Create or edit an activity
    activityView->>+activityHandler: Submit activity details
    activityHandler->>+activityRepository: Save activity changes
    activityRepository-->>-activityHandler: Updated activity
    activityHandler-->>-activityView: Return updated activity
    activityView-->>-User: Show updated activity

    %% Flow 3 - Remove an activity
    User->>+activityView: Delete an activity
    activityView->>+activityHandler: Remove activity
    activityHandler->>+activityRepository: Delete activity
    activityRepository-->>-activityHandler: Activity removed
    activityHandler-->>-activityView: Return removal result
    activityView-->>-User: Update activity list
```

## Covered flows

| Flow | What it shows |
|------|----------------|
| Browse activities | The user opens the activity dashboard and reviews the current list of activities. |
| Create or update an activity | The user adds a new activity or edits an existing one, and the system saves the latest activity details. |
| Remove an activity | The user removes an activity and the dashboard reflects the updated list. |
