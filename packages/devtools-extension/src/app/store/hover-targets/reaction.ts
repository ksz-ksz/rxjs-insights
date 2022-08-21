import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
} from '@lib/store';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

export const hoverTargetsReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(subscribersGraphActions.TargetHovered),
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
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(subscribersGraphActions.TargetUnhovered),
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
      )
    )
  );
