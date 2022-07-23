import { tracesClient } from '@app/clients/traces';
import { TraceFrame } from '@app/protocols/traces';
import { Location, Locations } from '@rxjs-insights/core';
import { fromSourcesPaneClient } from '@app/clients/sources-panel';
import {
  createChromeRuntimeClientAdapter,
  createChromeRuntimeServerAdapter,
  createClient,
  startServer,
} from '@lib/rpc';
import {
  ToSourcesPane,
  ToSourcesPaneChannel,
} from '@app/protocols/sources-panel';
import { EventRef, TargetRef } from '@app/protocols/refs';
import { targetsClient } from '@app/clients/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';

let isHandlingOpenResource = false;

const targetsNotificationsClient = createClient<TargetsNotifications>(
  createChromeRuntimeClientAdapter(TargetsNotificationsChannel)
);

function getShortLocationString(location: Location): string {
  return `${location.file.split('/').pop()}:${location.line}`;
}

export function getLocationString(location: Location) {
  return `${location.file}:${location.line}:${location.column}`;
}

function getLocation(locations: Locations | undefined): Location | undefined {
  if (locations !== undefined) {
    if (locations.originalLocation !== undefined) {
      return locations.originalLocation;
    }
    if (locations.generatedLocation !== undefined) {
      return locations.generatedLocation;
    }
  }
  return undefined;
}

function createEventElement(event: EventRef) {
  const eventEl = document.createElement('span');
  eventEl.classList.add('event', event.eventType);
  eventEl.textContent = event.name;
  eventEl.dataset.time = String(event.time);
  return eventEl;
}

function createTargetElement(target: TargetRef) {
  const targetEl = document.createElement('span');
  targetEl.classList.add('target', target.type);
  targetEl.textContent = target.name;
  targetEl.dataset.id = String(target.id);
  targetEl.dataset.tags = target.tags.join(', ');
  return targetEl;
}

function createLocationElement(location: Location) {
  const locationEl = document.createElement('span');
  locationEl.className = 'location';
  locationEl.textContent = getShortLocationString(location);
  locationEl.title = getLocationString(location);
  return locationEl;
}

function createLocationUnavailableElement() {
  const locationEl = document.createElement('span');
  locationEl.className = 'location';
  locationEl.textContent = 'N/A';
  locationEl.title = 'Target location is currently unavailable';
  return locationEl;
}

function createOpenElement(target: TargetRef) {
  const openEl = document.createElement('button');
  openEl.className = 'open';
  openEl.title = 'Inspect target in devtools panel';
  openEl.addEventListener('click', async (e) => {
    e.stopPropagation();
    await targetsClient.addTarget(target.objectId);
    await targetsNotificationsClient.notifyTarget(target);
  });
  return openEl;
}

function createFrameElement(frame: TraceFrame) {
  const frameEl = document.createElement('div');
  frameEl.classList.add('frame');
  frameEl.append(
    createEventElement(frame.event),
    createTargetElement(frame.target)
  );
  const location = getLocation(frame.locations);
  if (location) {
    frameEl.append(createLocationElement(location));
  } else {
    frameEl.append(createLocationUnavailableElement());
  }
  frameEl.append(createOpenElement(frame.target));
  frameEl.addEventListener('click', () => {
    if (location) {
      isHandlingOpenResource = true;
      chrome.devtools.panels.openResource(
        location.file,
        location.line - 1,
        () => {
          setTimeout(() => {
            isHandlingOpenResource = false;
          }, 200);
        }
      );
    }
    void fromSourcesPaneClient.setScope(frame.event);
  });

  return frameEl;
}

function createLabelElement(label: string) {
  const targetEl = document.createElement('span');
  targetEl.classList.add('label');
  targetEl.textContent = label;
  return targetEl;
}

function createTaskElement(task: { name: string; id: number }) {
  return createLabelElement(`${task.name} #${task.id}`);
}

function render(trace: TraceFrame[] | undefined) {
  document.body.textContent = '';
  if (trace !== undefined && trace.length > 0) {
    for (let i = 0; i < trace.length; i++) {
      const traceFrame = trace[i];
      const nextTraceFrame = trace[i + 1];
      document.body.append(createFrameElement(traceFrame));
      if (
        nextTraceFrame === undefined ||
        traceFrame.task.id !== nextTraceFrame.task.id
      ) {
        document.body.append(createTaskElement(traceFrame.task));
      }
    }
  } else {
    document.body.append(createLabelElement('Not available'));
  }
  const { height } = document.body.getBoundingClientRect();
  void fromSourcesPaneClient.setHeight(height);
}

async function update() {
  const trace = await tracesClient.getTrace();
  render(trace);
  if (!isHandlingOpenResource) {
    void fromSourcesPaneClient.setScope(trace?.at(0)?.event);
  }
}

startServer<ToSourcesPane>(
  createChromeRuntimeServerAdapter(ToSourcesPaneChannel),
  {
    onShown() {
      void update();
      chrome.devtools.panels.sources.onSelectionChanged.addListener(update);
    },
    onHidden() {
      chrome.devtools.panels.sources.onSelectionChanged.removeListener(update);
    },
  }
);

if (chrome.devtools.panels.themeName === 'dark') {
  document.body.classList.add('theme-dark');
}
