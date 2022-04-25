import type { ISubscriptionGrant, ISubscriptionMap } from 'mqtt';
import type { OnConnectCallback, OnErrorCallback, OnMessageCallback } from 'mqtt/types/lib/client';

export interface IMQTTAdapter {
  connected: boolean;
  publish(topic: string, message: string | Buffer): Promise<void>;
  subscribe(topic: string | string[] | ISubscriptionMap): Promise<ISubscriptionGrant[]>;
  on (event: 'connect', cb: OnConnectCallback): void
  on (event: 'message', cb: OnMessageCallback): void
  on (event: 'error', cb: OnErrorCallback): void;
  end():void;
}
