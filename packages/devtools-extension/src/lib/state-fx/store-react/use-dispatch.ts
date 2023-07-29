import { useStore } from './use-store';

export function useDispatch() {
  const store = useStore();
  return store.dispatch;
}
