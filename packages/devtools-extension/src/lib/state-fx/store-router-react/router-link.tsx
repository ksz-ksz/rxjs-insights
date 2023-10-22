import React from 'react';
import { Location, RouterActionTypes } from '@lib/state-fx/store-router';
import { useDispatch } from '@lib/state-fx/store-react';

export interface RouterLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  routerActions: RouterActionTypes;
  location: Location;
  state?: any;
  historyMode?: 'push' | 'replace';
}

export const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink(
    {
      routerActions,
      location,
      state,
      historyMode = 'push',
      target,
      onClick,
      ...rest
    },
    ref
  ) {
    const handleLinkClick = useLinkClickHandler(
      routerActions,
      location,
      state,
      historyMode,
      target
    );
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
  routerActions: RouterActionTypes,
  location: Location,
  state: any,
  historyMode: 'push' | 'replace',
  target: React.HTMLAttributeAnchorTarget | undefined
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

        dispatch(
          routerActions.Navigate({
            historyMode,
            location,
            state,
          })
        );
      }
    },
    [target, location]
  );
}

function isModifiedEvent(event: React.MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}
