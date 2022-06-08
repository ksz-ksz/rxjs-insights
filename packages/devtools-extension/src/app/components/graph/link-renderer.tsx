import { LinkData } from '@app/components/tree';
import React, { useRef } from 'react';
import {
  HorizontalLinkControl,
  LinkControl,
} from '@app/components/graph/link-control';

export type LinkRendererProps<T> = { link: LinkData<T> };
export const DefaultLinkRenderer = React.forwardRef<LinkControl>(
  function LinkRenderer(props, forwardedRef) {
    const pathRef = useRef<SVGPathElement | null>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => new HorizontalLinkControl(pathRef),
      []
    );

    return <path ref={pathRef} stroke="green" fill="transparent" />;
  }
);
