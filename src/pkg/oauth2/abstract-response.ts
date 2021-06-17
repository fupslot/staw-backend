import { OutgoingHttpHeaders, OutgoingHttpHeader } from "http";
import { lowercase } from "../../internal";

export class AbstractResponse {
  headers: OutgoingHttpHeaders;
  status: number;

  constructor() {
    this.status = 200;
    this.headers = {};
  }

  set(key: string, value: OutgoingHttpHeader): void {
    this.headers[lowercase(key)] = value;
  }

  get(key: string): OutgoingHttpHeader | undefined {
    return this.headers[lowercase(key)];
  }
}
