# RealTalk web client

Next.js frontend for the RealTalk chat backend. Sign in, pick a person, and talk to them in realtime over Socket.IO.

This project deploys on its own. It has no build time dependency on the backend repository. All it needs is the backend origin in one environment variable.

## Requirements

1. Node.js 20 or newer.
2. The chat backend running and reachable from the browser.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create the environment file.

```bash
cp .env.example .env.local
```

3. Set `NEXT_PUBLIC_API_URL` to the backend origin, with no trailing slash. For local work that is usually `http://localhost:4000`.

4. On the backend, add this app's origin to `CLIENT_ORIGINS` so the browser is allowed to send the session cookie. For local work that is `http://localhost:3000`.

## Running

```bash
npm run dev
```

The app is on `http://localhost:3000`. `npm run build` followed by `npm start` runs the production build.

## Testing the integration

There is a script that drives the real backend end to end. It creates three throwaway accounts, opens a conversation, connects two authenticated sockets, and asserts on what comes back.

```bash
npm run check:api
```

It covers health, signup, session persistence, validation failure, the user directory, opening a conversation twice without duplicating it, an outsider being refused, an anonymous request being refused, socket authentication through the session cookie, live message delivery, the delivered flag, the typing indicator, the read receipt, sending over REST, and history ordering. Any failure prints the line that failed and exits with a non zero code.

Point it at a deployed backend by setting `NEXT_PUBLIC_API_URL` before you run it.

## How this app reaches the backend

The browser calls the backend directly. There is no Next `/api` proxy layer, and that is a decision rather than an omission.

The backend authenticates the Socket.IO handshake by reading its own session cookie. A cookie belongs to one origin. If login went through a Next route handler, the browser would store the cookie against the Next origin, the socket would then open a connection straight to the backend with no cookie attached, and the backend would reject the handshake. A Next route handler also cannot proxy a WebSocket, because it cannot perform the protocol upgrade.

So REST and the socket both go to the backend origin, both with credentials included, and the cookie works for both. This also means the app deploys to any static or serverless host without needing a long lived Node process of its own.

Two things follow from that:

1. The backend must list this app's origin in `CLIENT_ORIGINS`.
2. In production both sides must be served over HTTPS, because the backend marks the cookie `Secure` with `SameSite=None` once `NODE_ENV` is `production`.

## Project structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.jsx              fonts and the providers
│   │   ├── globals.css             design tokens for light and dark
│   │   ├── page.jsx                sends you to the chat or to sign in
│   │   ├── login/page.jsx
│   │   └── chat/page.jsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-card.jsx       the sign in and create account card
│   │   │   ├── brand-panel.jsx
│   │   │   ├── fields.jsx          text field and password field
│   │   │   └── password-strength.jsx
│   │   ├── chat/
│   │   │   ├── chat-shell.jsx      composes the sidebar, panel and dialog
│   │   │   ├── sidebar.jsx
│   │   │   ├── profile-bar.jsx     avatar, account menu, theme toggle
│   │   │   ├── conversation-list.jsx
│   │   │   ├── chat-panel.jsx      header, empty state, thread
│   │   │   ├── message-list.jsx    day separators and scroll behaviour
│   │   │   ├── message-bubble.jsx  bubble and delivery ticks
│   │   │   ├── composer.jsx
│   │   │   └── new-chat-dialog.jsx
│   │   └── ui/
│   │       ├── avatar.jsx
│   │       ├── icons.jsx
│   │       └── ambient-background.jsx
│   ├── context/
│   │   ├── theme-context.jsx       light and dark, remembered
│   │   ├── auth-context.jsx        the signed in user
│   │   └── chat-context.jsx        threads, messages, presence, the socket
│   └── lib/
│       ├── http.js                 fetch wrapper that carries the cookie
│       ├── endpoints.js            one function per backend endpoint
│       ├── socket.js               socket factory and event names
│       └── format.js               initials, colours, timestamps, receipts
├── scripts/
│   └── check-api.mjs               the integration script
├── tailwind.config.js
├── next.config.mjs
├── .env.example
└── package.json
```

Components render. Contexts hold state and own side effects. The `lib` folder is the only place that knows the shape of the backend. Swapping an endpoint means touching one file.

## Design decisions

1. **State lives in three contexts, not one store.** Theme, session and chat change for different reasons and at different rates. Keeping them apart means a theme toggle does not re render the message list.

2. **`chat-context` owns the socket.** One connection per signed in user, opened when the session is known and torn down on logout. Every component reads presence, typing and messages from the same place, so the sidebar and the open thread can never disagree.

3. **Sending is optimistic.** The bubble appears the moment you press Enter, carrying a clock. When the server acknowledges, the temporary message is swapped for the stored one and the clock becomes ticks. If the send fails the bubble stays and is marked, rather than vanishing.

4. **Sending prefers the socket and falls back to REST.** The acknowledgement callback gives the same stored message the REST endpoint would return, so one code path handles both. If the socket is down the POST still works.

5. **Delivery state is read from the data, not tracked separately.** The backend keeps `deliveredTo` and `readBy` arrays on each message. The tick state is computed from whether the other person's id is in them, so a refresh shows exactly the same thing.

6. **Design tokens are CSS variables, and Tailwind reads them.** The palette from the prototype lives in `globals.css` under `:root` and `.dark`. Tailwind colour names map onto those variables, so `bg-window` is correct in both themes and dark mode is one class on the html element.

7. **The contact preview costs one extra call per thread.** The backend conversation list returns the unread count and the time of the last message but not its text. To show the preview line from the design, the app fetches the newest message for each thread on load. An endpoint that embedded the last message would remove those calls.

## The prototype and what changed

The layout, the type, the spacing, the colours, the animations, the dark theme and the copy all follow the prototype. Three things are different.

1. **The chat screen floats.** It sits inside an inset of about five percent of the shorter viewport edge, clamped between 16px and 56px, and the same animated gradient background from the auth screen shows through behind it. Below 900px the window goes full bleed, which is what the prototype already did.

2. **The delivery ticks are readable.** In the prototype the ticks are drawn in near white but sit below the bubble on a pale background, so they cannot be seen in the light theme. Here they inherit the muted text colour and turn blue once the message is read.

3. **The status line shows typing.** The backend emits a typing event and the design has no place for it, so the header status swaps from `Online` to `typing` while the other person is writing. Nothing was added to the layout.

Everything in the prototype that was mock data is now real. The contact list is your conversations, the new chat dialog lists the registered users, presence dots follow the socket, unread badges come from the server, and the message history survives a refresh.

## Assumptions

1. The backend is the one in the companion repository and is unchanged. Private conversations between exactly two people, no groups, no message deletion.
2. Signup takes a full name, a username and a password. There is no email and no password reset.
3. A user must be signed in before the socket connects. There is no anonymous mode.
4. The username shown with an `@` is a display convention. The value sent to the server never carries the `@`.
5. Deployment is handled separately.
