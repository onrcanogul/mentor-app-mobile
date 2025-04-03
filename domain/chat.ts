import { BaseEntity } from "./base/baseEntity";
import { Match } from "./match";
import { Message } from "./message";

export interface Chat extends BaseEntity {
  id: string;
  matchId: string;
  status: ChatStatus;
  isAiChat: boolean;
  match?: Match;
  messages: Message[];
}

export enum ChatStatus {
  Closed,
  Open,
}
