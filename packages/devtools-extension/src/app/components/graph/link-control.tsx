import { linkHorizontal } from 'd3-shape';
import { RefObject } from 'react';

export interface LinkPosition {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export interface LinkControl {
  opacity: number;
  position: LinkPosition;
}

export class DefaultLinkControl implements LinkControl {
  private static LINK = linkHorizontal();

  private _opacity = 0;
  private _position = {
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
  };

  constructor(
    private readonly elementRef: RefObject<SVGPathElement | null>,
    private readonly padding = 0
  ) {
    this.opacity = 0;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(opacity: number) {
    this._opacity = opacity;
    this.elementRef.current?.setAttribute('opacity', String(opacity));
  }

  get position(): LinkPosition {
    return this._position;
  }

  set position(position: LinkPosition) {
    this._position = position;
    const d = DefaultLinkControl.LINK({
      source: [position.sourceX + this.padding, position.sourceY],
      target: [position.targetX - this.padding, position.targetY],
    })!;
    this.elementRef.current?.setAttribute('d', d);
  }
}
