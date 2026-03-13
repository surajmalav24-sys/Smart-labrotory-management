# Smart Laboratory Management (React + Vite)

LabFix is a role-based EdTech + facility-management web app prototype.

## Features

- **Login page** with demo roles:
  - **Lab Fixer** (can view and manage all issues)
  - **Client/Student** (can create issues and view only their own posts)
- **Issue posting** for lab faults (projector, computers, network, software, electrical, etc.)
- **Role-based visibility**:
  - Fixer sees all requests
  - Student sees only their own requests
- **Issue workflow** for fixer: `Open -> In Progress -> Resolved`
- **Search + filters** (status and priority)
- **Responsive layout** for desktop/tablet/mobile

## Quick Start

Run commands in the folder containing `package.json`:

```bash
npm install
npm run dev
```

## Demo Credentials

- Fixer: `fixer` / `fixer123`
- Student: `james` / `student123`
- Student: `michael` / `student123`

## Build

```bash
npm run build
npm run preview
```

## Troubleshooting

If you get:

```text
npm ERR! enoent Could not read package.json
```

You are in the wrong folder. Move into the project directory first.
