import { EventRef } from '@app/protocols/refs';

export const ToSourcesPaneChannel = 'ToSourcesPane';
export const FromSourcesPaneChannel = 'FromSourcesPane';

export interface FromSourcesPane {
  setHeight(height: number): void;
  setScope(ref: EventRef | undefined): void;
}

export interface ToSourcesPane {
  onShown(): void;
  onHidden(): void;
}
