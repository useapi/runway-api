# Runway via useapi.net

This extension connects the hosted useapi.net Runway MCP server (`useapi-runwayml`, 25 tools). The tools make video with Gen-4.5, Seedance, Kling, Veo and the other models Runway hosts, edit video with Aleph, animate characters with Act-Two, swap voices and lip sync, make images and Frames, upscale video to 4K and manage assets and tasks, on the user's own Runway accounts.

- Endpoint: https://api.useapi.net/v1/runwayml/mcp (Streamable HTTP), authorized with the user's useapi.net API token in `USEAPI_TOKEN`.
- Before the tools work, the user needs a useapi.net API token (https://useapi.net/docs/start-here/setup-useapi) and an account connected at https://useapi.net/docs/start-here/setup-runwayml.
- If a tool returns 401, ask the user to check `USEAPI_TOKEN` (`gemini extensions config useapi-runway`). If it says no account is configured, point them to the setup page above.
- Generations spend the credits of the user's Runway account (`runway_get_features` shows what is left), except with `exploreMode: true` on Runway's Unlimited plan, which most models support. Ask before starting paid jobs, and report task status and links when they finish.
- Full tool list and limits: https://useapi.net/docs/api-runwayml-v1/mcp

useapi.net is a paid third-party API service ($15/month, covers every useapi.net API), not affiliated with Runway.
