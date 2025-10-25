# SpaceCMU Backend Example

This directory contains a **sample** backend implementation for the proposed
CMU‑only social network described in the project overview. The goal of this
example is to demonstrate how you might structure a Node.js/TypeScript server
using Express and TypeORM to support features such as anonymous personas,
friend connections, feeds, reporting and administrative moderation. This
implementation is **not production‑ready** – security, error handling,
authentication flows and performance tuning all require further work before
deployment.

## Project overview

The system models the following core concepts:

| Entity            | Purpose                                                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**          | Represents a single student with a unique CMU student ID and email. Users can author posts, create an anonymous persona, send/accept friend requests and file reports. An `isAdmin` flag elevates moderators. A `isBanned` flag disables access entirely. |
| **Persona**       | A pseudonymous identity tied one‑to‑one with a user. Personas have a display name, optional avatar and change limits to prevent abuse. Admins can ban a persona without affecting the underlying account.                                                 |
| **Post**          | Messages authored by users. Posts can be public or limited to friends. When `isAnonymous` is true the client displays the persona’s display name and avatar instead of the real user’s name.                                                              |
| **FriendRequest** | Tracks pending invitations between two users. When accepted the users become friends via a many‑to‑many relation on the `User` entity.                                                                                                                    |
| **Report**        | Complaints filed by users against posts or personas. Reports allow administrators to investigate and take action (ban persona, ban user or remove a post).                                                                                                |

## Important design considerations

- **One account per student**: the `studentId` and `email` fields are marked unique on the `User` entity. Registration should validate that the email belongs to the CMU domain.
- **Anonymous posting**: each user may create at most one `Persona`. The `upsertPersona` controller enforces a monthly change limit (default 2 changes) using `changeCount` and `lastChangedAt` fields. Anonymous posts require that the user has **at least 10 friends**.
- **Feeds**: the `getPublicFeed` controller returns public posts. The `getFriendFeed` controller fetches posts from the authenticated user and their friends, including both public and friend‑only visibility. Anonymous posts return persona details rather than real user names.
- **Friend connections**: a simple many‑to‑many relation on the `User` entity stores accepted friendships. The `sendFriendRequest` and `respondToFriendRequest` controllers manage pending invitations using a separate `FriendRequest` entity. Removing a friend simply updates the join table.
- **Moderation**: administrators can view reports and take actions. The `Admin` routes allow banning personas or users and removing posts. Banned personas/users are flagged and should be prevented from logging in or posting by authentication middleware (not fully implemented here).

## Running the example

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure database credentials. A sample `ormconfig` is provided that uses environment variables. Enable `synchronize` for auto‑migration during development (do **not** use in production).

3. Build the TypeScript code:

```bash
npm run build
```

4. Start the server:

```bash
npm start
```

5. Install Socket.IO

```bash
npm install socket.io

npm install -D @types/socket.io
```

6. Insatall for Upload Flie

```bash
npm install multer

npm install -D @types/multer
```

7. Insatall library for OAuth Google

```bash
npm install passport passport-google-oauth20 express-session

npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
```

Alternatively, during development you can run `npm run dev` which uses
`ts-node` to execute the TypeScript sources directly. The server listens on
`PORT` (defaults to `3000`) and exposes API routes under `/api`.

## API summary

Below is a condensed overview of the available routes. All request and
response bodies are JSON. Authentication middleware attaches the current
`user` to the request object.

### Authentication and user management

| Route                 | Method | Description                                                                                 |
| --------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `/api/users/register` | POST   | Register a new user. Body requires `studentId`, `email`, `password` and `name`.             |
| `/api/users/login`    | POST   | Authenticate with email and password. Returns a signed JWT.                                 |
| `/api/users/me`       | GET    | Get the current user’s profile including persona and friend count. Requires authentication. |

### Persona

| Route              | Method | Description                                                          |
| ------------------ | ------ | -------------------------------------------------------------------- |
| `/api/personas/me` | GET    | Retrieve the authenticated user’s persona (if any).                  |
| `/api/personas/`   | POST   | Create or update the user’s persona. Enforces monthly change limits. |

### Posts

| Route                     | Method | Description                                                                                                                                                           |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/posts/feed/public`  | GET    | Public feed of all posts. Anonymous posts show persona details.                                                                                                       |
| `/api/posts/feed/friends` | GET    | Friend feed of posts from the authenticated user and their friends.                                                                                                   |
| `/api/posts/`             | POST   | Create a new post. Body requires `content`; optional `imageUrl`, `isAnonymous` and `visibility` (`public` or `friends`). Anonymous posts require at least 10 friends. |
| `/api/posts/:id`          | GET    | Retrieve a single post by ID.                                                                                                                                         |

### Friends

| Route                              | Method | Description                                                                         |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| `/api/friends/request`             | POST   | Send a friend request. Body requires `toUserId`.                                    |
| `/api/friends/requests`            | GET    | List pending friend requests sent to or from the user.                              |
| `/api/friends/request/:id/respond` | POST   | Accept or decline a friend request. Body requires `action` (`accept` or `decline`). |
| `/api/friends/list`                | GET    | List the user’s friends.                                                            |
| `/api/friends/:friendId`           | DELETE | Remove a friend.                                                                    |

### Administration

All admin routes require the user to have `isAdmin=true`.

| Route                                | Method | Description                                                                            |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| `/api/admin/reports`                 | GET    | List reports. Optional `status` query filters by `pending`, `reviewed` or `actioned`.  |
| `/api/admin/report/:reportId/review` | POST   | Mark a report as reviewed.                                                             |
| `/api/admin/persona/:personaId/ban`  | POST   | Ban a persona. Optionally accepts `reportId` in the body to mark a report as actioned. |
| `/api/admin/user/:userId/ban`        | POST   | Ban a user account. Optionally accepts `reportId` in the body.                         |
| `/api/admin/post/:postId/takedown`   | POST   | Remove a post. Optionally accepts `reportId` in the body.                              |

## Extending this example

This repository intentionally keeps the scope small so it can be used as a
starting point. In a real implementation you would need to address:

- **SSO integration** with the CMU authentication system to guarantee one
  account per student.
- **Email verification** and secure password resets.
- **File storage** for user and persona avatars and post images (e.g. S3 or
  Google Cloud Storage).
- **Robust input validation** and sanitisation to prevent injection and XSS.
- **Pagination** and infinite scrolling for feeds.
- **Rate limiting** to mitigate spam and abuse.
- **Testing** and proper error handling.

Feel free to adapt and expand upon this example to suit your project’s
requirements.
