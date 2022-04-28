export interface TargetStatus {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

export interface TargetStatusNotifier {
  notifyEnabled(): void;
}
