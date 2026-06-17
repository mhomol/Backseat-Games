namespace BackseatGames.Relay;

public sealed class RoomRecord
{
    public required string JoinCode { get; init; }
    public required string SessionId { get; init; }
    public string HostName { get; set; } = string.Empty;
    public string? GameType { get; set; }
    public required string GroupName { get; init; }
    public DateTime ExpiresAt { get; set; }
    public string? HostConnectionId { get; set; }
    public Dictionary<string, string> PlayerConnections { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, string> ConnectionPlayers { get; } = new(StringComparer.Ordinal);
}

public sealed class RoomRegistry
{
    private static readonly TimeSpan RoomTtl = TimeSpan.FromHours(4);
    private static readonly char[] CodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray();
    private readonly object _lock = new();
    private readonly Dictionary<string, RoomRecord> _byCode = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, string> _sessionToCode = new(StringComparer.Ordinal);
    private readonly Dictionary<string, string> _connectionToCode = new(StringComparer.Ordinal);

    public RoomRecord CreateRoom(string sessionId, string hostName, string? gameType)
    {
        lock (_lock)
        {
            PurgeExpiredLocked();

            if (_sessionToCode.TryGetValue(sessionId, out var existingCode) &&
                _byCode.TryGetValue(existingCode, out var existing))
            {
                existing.HostName = hostName;
                existing.GameType = gameType;
                existing.ExpiresAt = DateTime.UtcNow.Add(RoomTtl);
                return existing;
            }

            string joinCode;
            do
            {
                joinCode = GenerateJoinCode();
            } while (_byCode.ContainsKey(joinCode));

            var room = new RoomRecord
            {
                JoinCode = joinCode,
                SessionId = sessionId,
                HostName = hostName,
                GameType = gameType,
                GroupName = $"room-{joinCode}",
                ExpiresAt = DateTime.UtcNow.Add(RoomTtl),
            };

            _byCode[joinCode] = room;
            _sessionToCode[sessionId] = joinCode;
            return room;
        }
    }

    public RoomRecord? GetRoom(string joinCode)
    {
        lock (_lock)
        {
            PurgeExpiredLocked();
            return _byCode.TryGetValue(NormalizeCode(joinCode), out var room) ? room : null;
        }
    }

    public void Touch(RoomRecord room)
    {
        lock (_lock)
        {
            room.ExpiresAt = DateTime.UtcNow.Add(RoomTtl);
        }
    }

    public void TrackConnection(RoomRecord room, string connectionId)
    {
        lock (_lock)
        {
            _connectionToCode[connectionId] = room.JoinCode;
        }
    }

    public void RemoveConnection(string connectionId)
    {
        lock (_lock)
        {
            if (!_connectionToCode.TryGetValue(connectionId, out var joinCode) ||
                !_byCode.TryGetValue(joinCode, out var room))
            {
                return;
            }

            _connectionToCode.Remove(connectionId);

            if (room.HostConnectionId == connectionId)
            {
                room.HostConnectionId = null;
            }

            if (room.ConnectionPlayers.Remove(connectionId, out var playerId))
            {
                room.PlayerConnections.Remove(playerId);
            }
        }
    }

    public static string NormalizeCode(string code) =>
        code.Replace("-", string.Empty, StringComparison.Ordinal).Trim().ToUpperInvariant();

    private static string GenerateJoinCode()
    {
        Span<char> buffer = stackalloc char[6];
        for (var i = 0; i < buffer.Length; i += 1)
        {
            buffer[i] = CodeChars[Random.Shared.Next(CodeChars.Length)];
        }

        return new string(buffer);
    }

    private void PurgeExpiredLocked()
    {
        var now = DateTime.UtcNow;
        var expired = _byCode.Where(pair => pair.Value.ExpiresAt <= now).Select(pair => pair.Key).ToList();
        foreach (var code in expired)
        {
            if (!_byCode.TryGetValue(code, out var room))
            {
                continue;
            }

            _byCode.Remove(code);
            _sessionToCode.Remove(room.SessionId);
        }
    }
}
