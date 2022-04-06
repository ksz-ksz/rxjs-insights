console.log('RxJS Insights content script');

injectPageScript(chrome.extension.getURL('/dist/page-script.js'));

function injectPageScript(src: string) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  document.documentElement.appendChild(script);
}