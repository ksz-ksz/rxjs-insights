chrome.devtools.panels.create('RxJS Insights', '', '/index.html');
chrome.devtools.panels.sources.createSidebarPane(
  'RxJS Insights - Trace',
  (pane) => {
    pane.setPage('/sources-page.html');
  }
);
