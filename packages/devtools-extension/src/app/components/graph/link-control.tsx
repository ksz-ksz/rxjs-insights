import { linkHorizontal } from 'd3-shape';
import { RefObject } from 'react';

export interface LinkControl {
  opacity: number;
  position: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  };
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

  constructor(private readonly elementRef: RefObject<SVGPathElement | null>) {}

  get opacity(): number {
    return this._opacity;
  }

  set opacity(opacity: number) {
    this._opacity = opacity;
    this.elementRef.current!.setAttribute('opacity', String(opacity));
  }

  get position(): {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  } {
    return this._position;
  }

  set position(position: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }) {
    this._position = position;
    const d = DefaultLinkControl.LINK({
      source: [position.sourceX, position.sourceY],
      target: [position.targetX, position.targetY],
    })!;
    this.elementRef.current!.setAttribute('d', d);
  }
}
