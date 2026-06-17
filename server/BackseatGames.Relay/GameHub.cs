using Microsoft.AspNetCore.SignalR;

namespace BackseatGames.Relay;

public sealed class GameHub(RoomRegistry registry) : Hub
{
    public async Task JoinRoom(string joinCode, string displayName, bool isHost, string playerId)
    {
        var room = registry.GetRoom(joinCode);
        if (room is null)
        {
            throw new HubException("That join code is not active. Ask the host for a new code.");
        }

        registry.Touch(room);
        registry.TrackConnection(room, Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, room.GroupName);

        if (isHost)
        {
            room.HostConnectionId = Context.ConnectionId;
        }

        room.ConnectionPlayers[Context.ConnectionId] = playerId;
        room.PlayerConnections[playerId] = Context.ConnectionId;
    }

    public async Task RouteMessage(string joinCode, string messageJson)
    {
        var room = registry.GetRoom(joinCode);
        if (room is null)
        {
            throw new HubException("Room expired.");
        }

        registry.Touch(room);

        using var document = System.Text.Json.JsonDocument.Parse(messageJson);
        var type = document.RootElement.GetProperty("type").GetString();
        var senderPlayerId = room.ConnectionPlayers.GetValueOrDefault(Context.ConnectionId);

        switch (type)
        {
            case "JOIN":
            case "ACTION":
                if (string.IsNullOrEmpty(room.HostConnectionId))
                {
                    throw new HubException("Host is not connected yet.");
                }

                await Clients.Client(room.HostConnectionId)
                    .SendAsync("ReceiveMessage", messageJson, senderPlayerId);
                break;

            case "WELCOME":
            case "ACTION_REJECTED":
                if (document.RootElement.TryGetProperty("playerId", out var playerIdElement))
                {
                    var targetPlayerId = playerIdElement.GetString();
                    if (!string.IsNullOrEmpty(targetPlayerId) &&
                        room.PlayerConnections.TryGetValue(targetPlayerId, out var targetConnection))
                    {
                        await Clients.Client(targetConnection)
                            .SendAsync("ReceiveMessage", messageJson, senderPlayerId);
                    }
                }
                break;

            default:
                await Clients.OthersInGroup(room.GroupName)
                    .SendAsync("ReceiveMessage", messageJson, senderPlayerId);
                break;
        }
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        registry.RemoveConnection(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
}
