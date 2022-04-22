export interface Devtools {
  isActive(): boolean;
}

export interface Notifier {
  ping(id: number): string;
}
