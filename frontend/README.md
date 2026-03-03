# CampusCompass - Frontend 🧭

This is the frontend application for the CampusCompass student support system. It features a role-based dashboard for students to seek mental health, academic, and general support, and for counselors to manage request queues and chat with students.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Setup

1. Install the project dependencies:
   ```bash
   npm install
   ```

````

2. Start the development server:
```bash
npm run dev

````

3. Open your browser and visit `http://localhost:5173` (or the port specified in your terminal).

## 🔐 Test Accounts (Mock Login)

The backend authentication API is currently being integrated. In the meantime, the frontend uses a mock login system to demonstrate role-based routing.

Please use the following test credentials to explore the different dashboards:

| Role          | Name          | Email            | Password |
| ------------- | ------------- | ---------------- | -------- |
| **Student**   | Rory Gilmore  | `rory@test.com`  | `123456` |
| **Student**   | Lane Kim      | `lane@test.com`  | `123456` |
| **Counselor** | Emily Gilmore | `emily@test.com` | `123456` |

> **Note:** Logging in as a **Student** will route you to the Support Request form and Personal Conversations. Logging in as a **Counselor** will grant access to the Request Queue and Active Chats.

## 🛠️ Tech Stack

- React
- Tailwind CSS
- Lucide React (Icons)
