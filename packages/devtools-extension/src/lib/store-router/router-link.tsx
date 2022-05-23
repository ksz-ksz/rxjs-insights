import { Router, Url } from '@lib/store-router';
import React from 'react';
import { useDispatch } from '@lib/store';

export interface RouterLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  router: Router<any, any, any>;
  to: Url;
}

export const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLinkWithRef({ router, to, target, onClick, ...rest }, ref) {
    const handleLinkClick = useLinkClickHandler(router, to, { target });
    function handleClick(
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) {
      onClick?.(event);
      if (!event.defaultPrevented) {
        handleLinkClick(event);
      }
    }

    return <a {...rest} onClick={handleClick} ref={ref} target={target} />;
  }
);

function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  router: Router<any, any, any>,
  to: Url,
  {
    target,
  }: {
    target?: React.HTMLAttributeAnchorTarget;
  } = {}
): (event: React.MouseEvent<E, MouseEvent>) => void {
  const dispatch = useDispatch();

  return React.useCallback(
    (event: React.MouseEvent<E, MouseEvent>) => {
      if (
        event.button === 0 &&
        (!target || target === '_self') &&
        !isModifiedEvent(event)
      ) {
        event.preventDefault();

        dispatch(router.actions.Navigate({ url: to }));
      }
    },
    [target, to]
  );
}

function isModifiedEvent(event: React.MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}
