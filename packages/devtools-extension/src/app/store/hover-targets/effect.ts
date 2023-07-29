import { createEffect } from '@lib/state-fx/store';
import { effect, filterActions } from '@lib/store';
import { filter } from 'rxjs';
import { uiActions } from '@app/actions/ui-actions';

export const hoverTargetsEffect = createEffect({
  namespace: 'hoverTargets',
  effects: {
    hover(action$) {
      return action$.pipe(
        filter(uiActions.TargetHoveredOnGraph.is),
        effect((action) => {
          const { target } = action.payload;
          document
            .querySelectorAll(`[data-target="${target.id}"]`)
            .forEach((element) => {
              if (element instanceof SVGCircleElement) {
                element.style.opacity = '0.3';
              }
            });
        })
      );
    },
    unhover(action$) {
      return action$.pipe(
        filter(uiActions.TargetUnhoveredOnGraph.is),
        effect((action) => {
          const { target } = action.payload;
          document
            .querySelectorAll(`[data-target="${target.id}"]`)
            .forEach((element) => {
              if (element instanceof SVGCircleElement) {
                element.style.opacity = '0';
              }
            });
        })
      );
    },
  },
});
