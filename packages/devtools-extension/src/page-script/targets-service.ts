import { Targets } from '@app/protocols/targets';
import { Observable, Subscriber } from '@rxjs-insights/recorder';
import { RefsService } from './refs-service';
import { TargetRef } from '@app/protocols/refs';

export class TargetsService implements Targets {
  private readonly pinnedTargets: Record<number, Observable | Subscriber> = {};
  private readonly lockedTargets: Record<number, Observable | Subscriber> = {};

  constructor(private readonly refs: RefsService) {}

  lockTarget(objectId: number) {
    const target = this.refs.getObject(objectId)! as Observable | Subscriber;
    this.lockedTargets[target.id] = target;
  }

  unlockTarget(objectId: number) {
    const target = this.refs.getObject(objectId)! as Observable | Subscriber;
    delete this.lockedTargets[target.id];
  }

  pinTarget(objectId: number) {
    const target = this.refs.getObject(objectId)! as Observable | Subscriber;
    this.pinnedTargets[target.id] = target;
  }

  unpinTarget(objectId: number) {
    const target = this.refs.getObject(objectId)! as Observable | Subscriber;
    delete this.pinnedTargets[target.id];
  }

  getTargets() {
    return Object.values(this.pinnedTargets).map(
      (target) => this.refs.create(target) as TargetRef
    );
  }
}
