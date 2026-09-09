# LarpDesk

LarpDesk is a lightweight help desk dashboard that combines tickets from multiple services into one web interface.

The goal is to make it easier to view, sort, assign, and manage support requests without constantly switching between different platforms.

## Current Integrations

- Gmail
- Jira
- Outlook

Gmail integration is currently the most developed.

## Features

- Unified ticket dashboard
- React frontend
- FastAPI backend
- Filter tickets by source
  - Jira
  - Outlook
  - Gmail
- Refresh tickets from the backend
- View full ticket details inside the web UI
- Open the original ticket/email
- Assign tickets to users
- Custom LarpDesk ticket workflow
- Persistent ticket assignments
- Persistent ticket statuses
- SQLite database
- Users loaded dynamically from `users.json`
- Status workflow loaded dynamically from `status.json`

## Tech Stack

### Backend

- Python
- FastAPI
- SQLite
- Google Gmail API
- Microsoft Graph planned for Outlook
- Jira REST API planned for Jira

### Frontend

- React
- Vite
- CSS

## Project Structure

```text
larpdesk/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── connectors/
│   │   ├── gmail.py
│   │   ├── jira.py
│   │   └── outlook.py
│   │
│   └── data/
│       ├── users.json
│       └── status.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── test/
│   └── get_gmail_rtoken.py
│
├── .env
├── .gitignore
├── shell.nix
└── README.md
