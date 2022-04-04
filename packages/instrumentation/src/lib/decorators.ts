import { getGlobalEnv } from './env';

const env = getGlobalEnv();

const IdentityDecorator = (name?: string) => () => {};

export const ObservableCreator = env
  ? (name?: string) =>
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        descriptor.value = env.instrumentCreator(
          propertyName ?? name,
          descriptor.value
        );
      }
  : IdentityDecorator;

export const ObservableOperator = env
  ? (name?: string) =>
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        descriptor.value = env.instrumentOperator(
          propertyName ?? name,
          descriptor.value
        );
      }
  : IdentityDecorator;
