import type { GameType, NetworkMessage } from '../types/game';
import type { DiscoveryHandler, MessageHandler, MultiplayerService } from './types';
import { getRelayBaseUrl, normalizeJoinCode } from '../constants/relay';
import { v4 as uuidv4 } from 'uuid';

type HubConnection = import('@microsoft/signalr').HubConnection;

type RoomInfo = {
  sessionId: string;
  hostName: string;
  gameType: GameType | null;
  joinCode: string;
};

function parseGameType(value: string | null | undefined): GameType | null {
  if (value === 'license-plates' || value === 'bingo' || value === 'sign-game') {
    return value;
  }
  return null;
}

export class RelayMultiplayerService implements MultiplayerService {
  readonly mode = 'relay' as const;
  readonly activeTransport = 'relay' as const;

  private connection: HubConnection | null = null;
  private messageHandler: MessageHandler | null = null;
  private joinCode: string | null = null;
  private sessionId: string | null = null;
  private hosting = false;
  private displayName = 'Player';
  private localPeerId = uuidv4();
  private connectPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Lazy-connect when hosting or joining.
  }

  dispose(): void {
    void this.disconnect();
    this.joinCode = null;
    this.sessionId = null;
    this.hosting = false;
  }

  getJoinCode(): string | null {
    return this.joinCode;
  }

  getRelaySessionId(): string | null {
    return this.sessionId;
  }

  async hostSession(
    sessionId: string,
    displayName: string,
    gameType: GameType | null = null,
  ): Promise<void> {
    this.hosting = true;
    this.sessionId = sessionId;
    this.displayName = displayName;

    const response = await fetch(`${getRelayBaseUrl()}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        hostName: displayName,
        gameType: gameType ?? '',
      }),
    });

    if (!response.ok) {
      throw new Error('Could not create online room. Check your internet connection.');
    }

    const payload = (await response.json()) as { joinCode: string; sessionId: string };
    this.joinCode = normalizeJoinCode(payload.joinCode);
    await this.ensureConnected();
    await this.connection!.invoke(
      'JoinRoom',
      this.joinCode,
      displayName,
      true,
      this.localPeerId,
    );
  }

  async joinSession(sessionId: string, displayName: string): Promise<void> {
    // Relay path uses join codes; sessionId arg may be the code from joinByCode flow.
    const code = this.joinCode ?? (isJoinCodeLike(sessionId) ? normalizeJoinCode(sessionId) : null);
    if (!code) {
      throw new Error('Join code required for online join.');
    }

    await this.joinByCode(code, displayName);
  }

  async joinByCode(joinCode: string, displayName: string): Promise<string> {
    const normalized = normalizeJoinCode(joinCode);
    const room = await this.fetchRoomInfo(normalized);

    this.hosting = false;
    this.joinCode = normalized;
    this.sessionId = room.sessionId;
    this.displayName = displayName;

    await this.ensureConnected();
    await this.connection!.invoke(
      'JoinRoom',
      normalized,
      displayName,
      false,
      this.localPeerId,
    );

    const joinMessage: NetworkMessage = { type: 'JOIN', name: displayName };
    await this.connection!.invoke('RouteMessage', normalized, JSON.stringify(joinMessage));

    return room.sessionId;
  }

  browseSessions(_onDiscovered: DiscoveryHandler): () => void {
    return () => {};
  }

  send(message: NetworkMessage): void {
    if (!this.connection || !this.joinCode) {
      return;
    }

    void this.connection.invoke('RouteMessage', this.joinCode, JSON.stringify(message));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandler = handler;
    return () => {
      if (this.messageHandler === handler) {
        this.messageHandler = null;
      }
    };
  }

  getLocalPeerId(): string {
    return this.localPeerId;
  }

  isHost(): boolean {
    return this.hosting;
  }

  registerHostedSessionGameType(_sessionId: string, _gameType: GameType | null): void {
    // Game type is set when the room is created.
  }

  private async fetchRoomInfo(joinCode: string): Promise<RoomInfo> {
    const response = await fetch(`${getRelayBaseUrl()}/rooms/${joinCode}`);
    if (!response.ok) {
      throw new Error('That join code is not active. Check the code with your host.');
    }

    const payload = (await response.json()) as {
      sessionId: string;
      hostName: string;
      gameType?: string | null;
      joinCode: string;
    };

    return {
      sessionId: payload.sessionId,
      hostName: payload.hostName,
      gameType: parseGameType(payload.gameType),
      joinCode: normalizeJoinCode(payload.joinCode),
    };
  }

  private async ensureConnected(): Promise<void> {
    if (this.connection?.state === 'Connected') {
      return;
    }

    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    this.connectPromise = this.connect();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async connect(): Promise<void> {
    const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');

    if (this.connection) {
      await this.disconnect();
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${getRelayBaseUrl()}/game`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ReceiveMessage', (messageJson: string, fromPeerId?: string) => {
      try {
        const parsed = JSON.parse(messageJson) as NetworkMessage;
        this.messageHandler?.(parsed, fromPeerId);
      } catch {
        // Ignore malformed payloads.
      }
    });

    await this.connection.start();
  }

  private async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.stop();
    } catch {
      // Ignore disconnect errors.
    }

    this.connection = null;
  }
}

function isJoinCodeLike(value: string): boolean {
  return /^[A-Z0-9-]{6,7}$/i.test(value.trim());
}

export function createRelayMultiplayerService(): RelayMultiplayerService {
  return new RelayMultiplayerService();
}
