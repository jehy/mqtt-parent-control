import {IMQTTAdapter} from "./IMQTTAdapter";
import {OnConnectCallback, OnErrorCallback, OnMessageCallback} from "mqtt/types/lib/client";
import {ISubscriptionGrant, ISubscriptionMap} from "mqtt";

export class DummyMqttClient implements  IMQTTAdapter{
    connected: boolean;
    constructor() {
        this.connected = false;
    }

    end(): void {
    }


    // @ts-ignore
    publish(_topic: string, _message: string | Buffer): Promise<void> {
        return Promise.resolve(undefined);
    }

    subscribe(_topic: string | string[] | ISubscriptionMap): Promise<ISubscriptionGrant[]> {
        return Promise.resolve([]);
    }

    on(_event: "connect" | "message" | "error", _cb: OnConnectCallback | OnMessageCallback | OnErrorCallback): void {
        return undefined;
    }
}
