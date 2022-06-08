import { LinkData } from '@app/components/tree';
import React, { useRef } from 'react';
import { DefaultLinkControl, LinkControl } from './link-control';

export type LinkRendererProps<T> = { link: LinkData<T> };
export const DefaultLinkRenderer = React.forwardRef<
  LinkControl,
  LinkRendererProps<any>
>(function DefaultLinkRenderer(props, forwardedRef) {
  const elementRef = useRef<SVGPathElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new DefaultLinkControl(elementRef),
    []
  );

  return <path ref={elementRef} stroke="green" fill="transparent" />;
});
