import { createContext } from 'react';
import { Store } from '@lib/state-fx/store';

export const StoreContext = createContext<Store<any>>(undefined!);
