using BackseatGames.Relay;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<RoomRegistry>();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(_ => true)
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/rooms", (CreateRoomRequest request, RoomRegistry registry) =>
{
    if (string.IsNullOrWhiteSpace(request.SessionId) || string.IsNullOrWhiteSpace(request.HostName))
    {
        return Results.BadRequest(new { error = "sessionId and hostName are required." });
    }

    var room = registry.CreateRoom(
        request.SessionId.Trim(),
        request.HostName.Trim(),
        string.IsNullOrWhiteSpace(request.GameType) ? null : request.GameType.Trim());

    return Results.Ok(new CreateRoomResponse(room.JoinCode, room.SessionId));
});

app.MapGet("/rooms/{joinCode}", (string joinCode, RoomRegistry registry) =>
{
    var room = registry.GetRoom(joinCode);
    if (room is null)
    {
        return Results.NotFound(new { error = "Room not found." });
    }

    return Results.Ok(new RoomInfoResponse(room.SessionId, room.HostName, room.GameType, room.JoinCode));
});

app.MapHub<GameHub>("/game");

app.Run();

public sealed record CreateRoomRequest(string SessionId, string HostName, string? GameType);

public sealed record CreateRoomResponse(string JoinCode, string SessionId);

public sealed record RoomInfoResponse(string SessionId, string HostName, string? GameType, string JoinCode);
