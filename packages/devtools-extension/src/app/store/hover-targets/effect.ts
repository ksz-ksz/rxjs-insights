import { createEffectComponent, effect } from '@lib/state-fx/store';
import { uiActions } from '@app/actions/ui-actions';

export const hoverTargetsEffect = createEffectComponent(() => ({
  name: 'hoverTargets',
  effects: {
    hover(action$) {
      return action$.ofType(uiActions.TargetHoveredOnGraph).pipe(
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
      return action$.ofType(uiActions.TargetUnhoveredOnGraph).pipe(
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
}));
