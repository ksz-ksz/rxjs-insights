import { RefsService } from './refs-service';
import { createClient, createDocumentEventClientAdapter } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { ObservableLike, SubscriberLike } from '@rxjs-insights/core';
import {
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import { TargetRef } from '@app/protocols/refs';
import { TargetsService } from './targets-service';

function getTarget(maybeTarget: ObservableLike | SubscriberLike) {
  if (isSubscriberTarget(maybeTarget)) {
    return getSubscriber(maybeTarget);
  }
  if (isObservableTarget(maybeTarget)) {
    return getObservable(maybeTarget);
  }
  return undefined;
}

export function createInspectFunction(
  refs: RefsService,
  targets: TargetsService
) {
  const targetsNotificationsClient = createClient<TargetsNotifications>(
    createDocumentEventClientAdapter(TargetsNotificationsChannel)
  );

  function inspect(maybeTarget: ObservableLike | SubscriberLike) {
    const target = getTarget(maybeTarget);
    if (target) {
      const targetRef = refs.create(target) as TargetRef;
      targets.pinTarget(targetRef.objectId);
      void targetsNotificationsClient.notifyTarget(targetRef);
    }
    return maybeTarget;
  }

  return inspect;
}
