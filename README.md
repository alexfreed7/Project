# Ready Check

**Live app:** https://readycheck-tau.vercel.app/

A tiny app for getting a group out the door. Make a room, share the link, and
everyone taps their own status (Not Ready / Getting Ready / Almost Ready /
Ready to Go!) so you can see at a glance who's actually ready — no accounts,
no app install, just a link.

- Anyone with the room link can join and update their own status.
- Everyone's status updates live for the whole group (polls every ~2.5s).
- Once people are out, they can add a quick note or location too (e.g. "at
  Bar X", "in the bathroom") via a few one-tap suggestions or free text.
- Anyone can remove themselves from a room with "Leave Room / Remove My Name".
- Rooms auto-expire after 24 hours of inactivity — nothing to clean up.

## How it's built

- [Next.js](https://nextjs.org/) (App Router) for the frontend and a couple
  of small API routes.
- [Upstash Redis](https://upstash.com/) (free tier) for the shared live
  state — a room is just a Redis hash of `memberId -> {name, status}`.

## Deploy it (free, ~5 minutes)

You need somewhere to host it and somewhere to store the shared room state.
Both have generous free tiers and need no credit card to start.

1. **Create a free Redis database on Upstash**
   - Go to [upstash.com](https://upstash.com/) and sign up (GitHub login
     works).
   - Create a new Redis database (any region close to you is fine).
   - On the database's "REST API" tab, copy the `UPSTASH_REDIS_REST_URL`
     and `UPSTASH_REDIS_REST_TOKEN` values.

2. **Deploy this repo to Vercel**
   - Go to [vercel.com](https://vercel.com/) and sign up / log in with
     GitHub.
   - Click "Add New Project" and import this repository.
   - Before the first deploy, add the two environment variables from step 1
     under Project Settings → Environment Variables:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
   - Deploy. Vercel will give you a public URL like
     `https://your-project.vercel.app`.

3. **Share it**
   - Open the URL, create a room (e.g. `friday-dinner`), and send the room
     link to your group. That's it — everyone can open it and check in.

## Running locally

```bash
npm install
# create a .env.local with:
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...
npm run dev
```

Then open http://localhost:3000.
