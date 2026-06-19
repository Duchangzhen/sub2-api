# AnyRouter Render Bridge

This small Render service forwards OpenAI-compatible API requests to `https://anyrouter.top` while pinning DNS resolution to `47.246.23.200`.

## Deploy on Render

1. Create a new GitHub repository with these files.
2. In Render, create a new Web Service from that repository.
3. Use:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
4. After deployment, open:
   `https://YOUR-SERVICE.onrender.com/v1/models`

If it returns `401 未提供令牌`, the bridge is working.

## Use in your relay

In your existing relay channel, replace the AnyRouter base URL:

```text
https://anyrouter.top
```

with:

```text
https://YOUR-SERVICE.onrender.com
```

Keep the same AnyRouter API key.
