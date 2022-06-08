import { RefObject } from 'react';

export interface NodeControl {
  opacity: number;
  position: {
    x: number;
    y: number;
  };
}

export class DefaultNodeControl implements NodeControl {
  constructor(private readonly elementRef: RefObject<SVGElement>) {}

  private _opacity = 0;
  private _position = {
    x: 0,
    y: 0,
  };

  get opacity(): number {
    return this._opacity;
  }

  set opacity(opacity: number) {
    this._opacity = opacity;
    this.elementRef.current!.setAttribute('opacity', String(opacity));
  }

  get position(): { x: number; y: number } {
    return this._position;
  }

  set position(position: { x: number; y: number }) {
    this._position = position;
    this.elementRef.current!.setAttribute(
      'transform',
      `translate(${position.x}, ${position.y})`
    );
  }
}
