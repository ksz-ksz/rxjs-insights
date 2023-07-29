import { createEffect, EffectFunction, Effects } from '@lib/state-fx/store';
import { useEffect } from 'react';
import { useStore } from './use-store';

export function useRegisterEffect<TState>(
  fn: EffectFunction<TState>,
  deps: any[] = []
) {
  const store = useStore();
  useEffect(() => {
    const effect = createEffect({
      namespace: 'useRegisterEffect',
      effects: { effect: fn },
    });
    const subscription = store.registerEffect(effect);

    return () => subscription.unsubscribe();
  }, [store, deps]);
}
