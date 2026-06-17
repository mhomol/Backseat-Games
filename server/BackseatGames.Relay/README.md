# Backseat Games relay

Ephemeral SignalR relay for join-code multiplayer. Host-authoritative game logic stays on the phone; this server only routes JSON messages between players in a room.

## Run locally

```bash
cd server/BackseatGames.Relay
dotnet run
```

Default URL: `http://localhost:5080` (see `Properties/launchSettings.json`).

Set in the app:

```bash
EXPO_PUBLIC_RELAY_URL=http://YOUR_LAN_IP:5080
```

## API


| Endpoint        | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `GET /health`   | Liveness check                                                   |
| `POST /rooms`   | `{ sessionId, hostName, gameType? }` → `{ joinCode, sessionId }` |
| SignalR `/game` | `JoinRoom`, `RouteMessage`                                       |


Rooms expire after **4 hours** of inactivity.

## Deploy to Azure Container Apps

```bash
cd server/BackseatGames.Relay
az acr build --registry <acr> --image backseat-relay:latest .
az containerapp create \
  --name backseat-relay \
  --resource-group backseat-games-rg \
  --environment <env> \
  --image <acr>.azurecr.io/backseat-relay:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 1
```

Set `EXPO_PUBLIC_RELAY_URL` in EAS / GitHub Actions to the container app URL (HTTPS).