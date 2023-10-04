import { createContext } from 'react';
import { Container } from '@lib/state-fx/store';

export const ContainerContext = createContext<Container>(undefined!);
