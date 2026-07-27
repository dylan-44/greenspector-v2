function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ICONS = {
  check:
    '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  'mobile-screen':
    '<svg viewBox="0 0 384 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M80 0C44.7 0 16 28.7 16 64v384c0 35.3 28.7 64 64 64h224c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H80zm80 432h64c8.8 0 16 7.2 16 16s-7.2 16-16 16h-64c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>',
  'battery-half':
    '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M464 160c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H112c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h48v96H112c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h400c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16H416V160h48zM288 368c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16h96c8.8 0 16 7.2 16 16v224z"/></svg>',
  'shield-halved':
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z"/></svg>',
  plug: '<svg viewBox="0 0 384 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM160 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM32 256v128c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V256H32z"/></svg>',
  gitlab:
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M105.2 132.9c-3.8 0-7.2 2.1-8.9 5.5L2.1 308.1c-1.7 3.4-1.7 7.4 0 10.8s4.9 5.5 8.9 5.5h490.1c4 0 7.2-2.1 8.9-5.5 1.7-3.4 1.7-7.4 0-10.8L415.7 138.4c-1.7-3.4-5.1-5.5-8.9-5.5H105.2zm152.5 0c-3.8 0-7.2 2.1-8.9 5.5l-34.2 68.4c-1.7 3.4-1.7 7.4 0 10.8s4.9 5.5 8.9 5.5h68.4c4 0 7.2-2.1 8.9-5.5 1.7-3.4 1.7-7.4 0-10.8l-34.2-68.4c-1.7-3.4-5.1-5.5-8.9-5.5h-6.8z"/></svg>',
  'chart-line':
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L217.4 198.6 275 256.1l86.6-86.6z"/></svg>',
  'people-group':
    '<svg viewBox="0 0 640 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z"/></svg>',
  'house-laptop':
    '<svg viewBox="0 0 640 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M48 48C21.5 48 0 69.5 0 96V384c0 35.3 28.7 64 64 64H272l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H378.7l-10.7-32H576c35.3 0 64-28.7 64-64V96c0-26.5-21.5-48-48-48H48zM64 96H576V384H64V96z"/></svg>',
  bullseye:
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',
  'cake-candles':
    '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M86.4 5.5L61.8 47.6C58 54.1 56 61.6 56 69.2V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15.1-5.8-21.6L105.6 5.5C103.6 2.1 100 0 96 0s-7.6 2.1-9.6 5.5zm128 0L189.8 47.6C186 54.1 184 61.6 184 69.2V72c0 22.1 17.9 40 40 40s40-17.9 40-40V69.2c0-7.6-2-15.1-5.8-21.6L233.6 5.5C231.6 2.1 228 0 224 0s-7.6 2.1-9.6 5.5zM0 160c0-8.8 7.2-16 16-16H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H16c-8.8 0-16-7.2-16-16zm0 104c0-8.8 7.2-16 16-16H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H16c-8.8 0-16-7.2-16-16zM24 368c0-8.8 7.2-16 16-16H408c8.8 0 16 7.2 16 16v48c0 35.3-28.7 64-64 64H72c-35.3 0-64-28.7-64-64V368z"/></svg>',
  bicycle:
    '<svg viewBox="0 0 640 512" aria-hidden="true" focusable="false" width="1em" height="1em" fill="currentColor"><path d="M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm27.2 112.8c-12.5 17.3-33.2 28.8-56.5 28.8H384v32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-53 0-96-43-96-96s43-96 96-96h4.2c12.3 0 23-8.2 27-20.1l5.9-17.8c5.1-15.4 19.2-25.9 35.2-25.9H520c13.3 0 24 10.7 24 24s-10.7 24-24 24H348.9l-2.4 7.2H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H315.1c-2.4 6.5-7.4 11.7-13.7 14.6C273.4 357.4 256 385.2 256 416c0 53 43 96 96 96h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H352c-88.4 0-160-71.6-160-160 0-60.5 33.7-113.1 83.2-140.8zM160 416a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm304-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z"/></svg>'
};

function renderIcon(name) {
  return ICONS[name] || ICONS.check;
}

function replaceFontAwesomeInHtml(html) {
  if (!html) {
    return '';
  }

  let out = html.replace(
    /<i class="fa-(?:solid|brands|regular) fa-([a-z0-9-]+)"[^>]*><\/i>/gi,
    (_, name) => renderIcon(name)
  );

  return out;
}

module.exports = {
  esc,
  renderIcon,
  replaceFontAwesomeInHtml
};
