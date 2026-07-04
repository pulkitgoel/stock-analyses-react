export interface Analysis {
  title: string;
  ticker: string;
  file: string;
  slug?: string;
  date: string;
  tags: string[];
  summary: string;
  model?: string;
}

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};
