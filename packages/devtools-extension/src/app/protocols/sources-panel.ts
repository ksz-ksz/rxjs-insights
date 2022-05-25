export const ToSourcesPaneChannel = 'ToSourcesPane';
export const FromSourcesPaneChannel = 'FromSourcesPane';

export interface FromSourcesPane {
  setHeight(height: number): void;
}

export interface ToSourcesPane {
  onShown(): void;
  onHidden(): void;
}
