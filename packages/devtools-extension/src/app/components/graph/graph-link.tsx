import {
  DefaultLinkRenderer,
  LinkRendererProps,
} from '@app/components/graph/link-renderer';
import React, { useCallback, useEffect, useRef } from 'react';
import { LinkControl } from '@app/components/graph/link-control';
import gsap from 'gsap';
import { duration } from '@app/components/graph/constants';
import { Transition } from 'react-transition-group';
import { LinkData } from '@app/components/tree';
import { Renderer } from '@app/components/graph/renderer';

export interface GraphLinkProps<T> {
  in?: boolean;
  link: LinkData<T>;
  linkRenderer?: Renderer<LinkRendererProps<T>, LinkControl>;
}

export function GraphLink<T>({
  in: inProp,
  link,
  linkRenderer: LinkRenderer = DefaultLinkRenderer,
}: GraphLinkProps<T>) {
  const linkRef = useRef<LinkControl | null>(null);
  const opacityTweenRef = useRef<gsap.core.Tween | null>(null);
  const positionTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(
    function onUpdate() {
      positionTweenRef.current?.kill();
      positionTweenRef.current = gsap.to(
        { ...linkRef.current!.position },
        {
          sourceX: link.source.x,
          sourceY: link.source.y,
          targetX: link.target.x,
          targetY: link.target.y,
          onUpdate() {
            const [target] = this.targets();
            linkRef.current!.position = {
              sourceX: target.sourceX,
              sourceY: target.sourceY,
              targetX: target.targetX,
              targetY: target.targetY,
            };
          },
          duration: duration,
          delay: duration,
        }
      );
    },
    [link]
  );

  // TODO: cleanup
  const setRef = useCallback((ref) => {
    if (ref) {
      linkRef.current = ref;
      requestAnimationFrame(() => {
        linkRef.current!.opacity = 0;
      });
    }
  }, []);

  return (
    <Transition<any>
      appear={true}
      mountOnEnter
      unmountOnExit
      in={inProp}
      timeout={duration * 3000}
      onEnter={() => {
        opacityTweenRef.current = gsap.to(linkRef.current!, {
          opacity: 1,
          duration,
          delay: 2 * duration,
        });
      }}
      onExit={() => {
        opacityTweenRef.current?.kill();
        opacityTweenRef.current = gsap.to(linkRef.current!, {
          opacity: 0,
          duration,
          delay: 0,
          ease: 'none',
        });
      }}
    >
      <LinkRenderer link={link} ref={setRef} />
    </Transition>
  );
}
