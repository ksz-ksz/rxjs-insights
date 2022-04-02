export namespace Color {
  export namespace Target {
    export namespace Observable {
      export const Primary = '#42a5f5';
      export const Secondary = '#90caf9';
    }
    export namespace Subscription {
      export const Primary = '#ab47bc';
      export const Secondary = '#ce93d8';
    }
  }

  export namespace Event {
    export namespace Next {
      export const Primary = '#388e3c';
      export const Secondary = '#66bb6a';
    }
    export namespace Error {
      export const Primary = '#d32f2f';
      export const Secondary = '#f44336';
    }
    export namespace Complete {
      export const Primary = '#0288d1';
      export const Secondary = '#29b6f6';
    }
    export namespace Subscription {
      export const Primary = '#f57c00';
      export const Secondary = '#ffa726';
    }
  }
}

export function getEventColor(name: string, target = true) {
  if (name === 'next') {
    return target ? Color.Event.Next.Primary : Color.Event.Next.Secondary;
  } else if (name === 'error') {
    return target ? Color.Event.Error.Primary : Color.Event.Error.Secondary;
  } else if (name === 'complete') {
    return target
      ? Color.Event.Complete.Primary
      : Color.Event.Complete.Secondary;
  } else {
    return target
      ? Color.Event.Subscription.Primary
      : Color.Event.Subscription.Secondary;
  }
}
