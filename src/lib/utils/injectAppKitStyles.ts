const RETRO_COLORS = {
  window: '#d4d0c8',
  windowAlt: '#e4e0d6',
  borderLight: '#fcfcfc',
  borderMid: '#9d9d9d',
  borderDark: '#000000',
  accent: '#001a9d',
  accentAlt: '#0a6edb',
  overlay: 'rgba(0, 74, 78, 0.92)',
  text: '#050505',
  textMuted: '#3a3a3a',
  success: '#0f7b0f',
  titleBar: 'linear-gradient(90deg, #000080, #1084d0)',
  titleText: '#ffffff',
};

type ShadowLike = ShadowRoot | (HTMLElement & { shadowRoot: ShadowRoot | null });

const SHADOW_MARK = 'data-retro-style';

const MODAL_SELECTORS = [
  {
    selector: 'wui-modal',
    marker: 'retro-modal-container',
    css: `
      :host {
        background: ${RETRO_COLORS.window} !important;
        border-top: 3px solid ${RETRO_COLORS.borderLight} !important;
        border-left: 3px solid ${RETRO_COLORS.borderLight} !important;
        border-right: 3px solid ${RETRO_COLORS.borderDark} !important;
        border-bottom: 3px solid ${RETRO_COLORS.borderDark} !important;
        box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.55) !important;
        padding: 0 !important;
      }

      :host > wui-flex {
        background: ${RETRO_COLORS.window} !important;
      }
    `,
  },
  {
    selector: 'wui-card',
    marker: 'retro-card',
    css: `
      :host {
        background: ${RETRO_COLORS.window} !important;
        border: 3px solid ${RETRO_COLORS.window} !important;
        outline: 1px solid ${RETRO_COLORS.borderDark} !important;
        box-shadow: 
          inset 1px 1px 0 ${RETRO_COLORS.borderLight},
          inset -1px -1px 0 ${RETRO_COLORS.borderMid},
          2px 2px 0 rgba(0, 0, 0, 0.3) !important;
        padding: 4px 0 0 0 !important;
        border-radius: 0 !important;
      }

      :host([data-variant='thin']) {
        border-width: 3px !important;
      }

      wui-flex {
        padding-top: 16px !important;
      }

      > wui-flex {
        padding-top: 16px !important;
      }
    `,
  },
  {
    selector: 'w3m-header',
    marker: 'retro-header',
    css: `
      :host {
        height: auto !important;
        border: none !important;
        margin: 0 !important;
        padding: 2px 0 !important;
        background: transparent !important;
      }

      :host > wui-flex {
        background: ${RETRO_COLORS.titleBar} !important;
        padding: 4px 4px 4px 6px !important;
        color: ${RETRO_COLORS.titleText} !important;
        min-height: 32px !important;
        max-height: 32px !important;
        align-items: center !important;
        gap: 6px !important;
        font-weight: bold !important;
        font-size: 11px !important;
        letter-spacing: 0px !important;
      }

      :host > wui-flex > * {
        background: transparent !important;
        color: ${RETRO_COLORS.titleText} !important;
      }

      wui-text {
        color: ${RETRO_COLORS.titleText} !important;
        font-weight: bold !important;
        font-size: 11px !important;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        filter: brightness(0) invert(1) !important;
      }

      wui-icon-button {
        filter: brightness(0) invert(1) !important;
        opacity: 1 !important;
      }

      wui-icon-button:hover {
        filter: brightness(0) invert(1) !important;
        opacity: 0.8 !important;
      }

      wui-tag {
        display: none !important;
      }
    `,
  },
  {
    selector: 'wui-separator',
    marker: 'retro-separator',
    css: `
      :host {
        background: transparent !important;
        padding: 0 !important;
        margin: 12px 0 !important;
      }

      :host::before {
        content: '';
        display: block;
        height: 2px;
        background:
          linear-gradient(
            90deg,
            ${RETRO_COLORS.borderLight},
            ${RETRO_COLORS.borderLight} 50%,
            ${RETRO_COLORS.borderDark} 50%,
            ${RETRO_COLORS.borderDark}
          ) !important;
      }
    `,
  },
  {
    selector: 'wui-button',
    marker: 'retro-button',
    css: `
      * {
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
        transition: none !important;
        will-change: auto !important;
        overflow: hidden !important;
      }

      :host {
        overflow: hidden !important;
      }

      button,
      button *,
      button::before,
      button::after,
      button:hover,
      button:active,
      button:focus {
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
        font-size: 11px !important;
        background: ${RETRO_COLORS.window} !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} !important;
        color: ${RETRO_COLORS.text} !important;
        text-transform: none !important;
        box-shadow: none !important;
        transition: none !important;
        will-change: auto !important;
        padding: 4px 12px !important;
        min-height: 23px !important;
        outline: 1px solid ${RETRO_COLORS.borderMid} !important;
        outline-offset: -3px !important;
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
        overflow: hidden !important;
      }

      button[data-variant='accent-primary'],
      button[data-variant='accent-secondary'],
      button[data-variant='neutral-primary'],
      button[data-variant='neutral-secondary'] {
        background: ${RETRO_COLORS.window} !important;
        color: ${RETRO_COLORS.text} !important;
        border-radius: 0 !important;
      }

      button:hover:not(:disabled) {
        background: ${RETRO_COLORS.windowAlt} !important;
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
        transition: none !important;
        will-change: auto !important;
      }

      button:active:not(:disabled) {
        border-color: ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} !important;
        padding: 5px 11px 3px 13px !important;
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
        transition: none !important;
        will-change: auto !important;
      }

      button:disabled {
        color: ${RETRO_COLORS.textMuted} !important;
        text-shadow: 1px 1px 0 ${RETRO_COLORS.borderLight} !important;
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
        transition: none !important;
        will-change: auto !important;
      }
    `,
  },
  {
    selector: 'wui-icon-button',
    marker: 'retro-icon-button',
    css: `
      * {
        border-radius: 0 !important;
        clip-path: inset(0 round 0) !important;
      }

      button,
      button *,
      button::before,
      button::after {
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
        background: ${RETRO_COLORS.window} !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} !important;
        color: ${RETRO_COLORS.text} !important;
        width: 23px !important;
        height: 21px !important;
        padding: 0 !important;
        box-shadow: none !important;
        transition: none !important;
        border-radius: 0 !important;
        clip-path: inset(0 round 0) !important;
      }

      button:hover:not(:disabled) {
        background: ${RETRO_COLORS.windowAlt} !important;
        border-radius: 0 !important;
        clip-path: inset(0 round 0) !important;
      }

      button:active:not(:disabled) {
        border-color: ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} !important;
        border-radius: 0 !important;
        clip-path: inset(0 round 0) !important;
      }

      wui-icon,
      svg,
      path {
        color: inherit !important;
        fill: currentColor !important;
        border-radius: 0 !important;
      }
    `,
  },
  {
    selector: 'wui-list-item',
    marker: 'retro-list-item',
    css: `
      * {
        border-radius: 0 !important;
      }

      :host {
        background: ${RETRO_COLORS.window} !important;
        border: 1px solid ${RETRO_COLORS.borderMid} !important;
        margin-bottom: 2px !important;
        padding: 6px 8px !important;
        font-size: 11px !important;
        border-radius: 0 !important;
      }

      :host(:hover) {
        background: ${RETRO_COLORS.accent} !important;
        color: ${RETRO_COLORS.titleText} !important;
        border-radius: 0 !important;
      }

      :host(:hover) wui-text {
        color: ${RETRO_COLORS.titleText} !important;
      }

      wui-text {
        font-size: 11px !important;
        line-height: 1.2 !important;
      }
    `,
  },
  {
    selector: 'w3m-all-wallets-list-item',
    marker: 'retro-wallet-item',
    css: `
      * {
        border-radius: 0 !important;
      }

      button,
      button *,
      button::before,
      button::after {
        background: ${RETRO_COLORS.window} !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} !important;
        border-radius: 0 !important;
        transition: none !important;
        padding: 8px 6px !important;
        row-gap: 6px !important;
        color: ${RETRO_COLORS.text} !important;
        outline: 1px solid ${RETRO_COLORS.borderMid} !important;
        outline-offset: -3px !important;
      }

      button:hover:not(:disabled) {
        background: ${RETRO_COLORS.accent} !important;
        color: ${RETRO_COLORS.titleText} !important;
        border-radius: 0 !important;
      }

      button:hover:not(:disabled) wui-text {
        color: ${RETRO_COLORS.titleText} !important;
      }

      button:active:not(:disabled) {
        border-color: ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} !important;
        padding: 9px 5px 7px 7px !important;
        border-radius: 0 !important;
      }
    `,
  },
  {
    selector: 'wui-wallet-image',
    marker: 'retro-wallet-image',
    css: `
      :host {
        background: #ffffff !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderMid} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderMid} !important;
        box-shadow: inset 1px 1px 0 ${RETRO_COLORS.borderDark} !important;
        width: 40px !important;
        height: 40px !important;
      }

      :host > wui-flex {
        border-radius: 0 !important;
      }

      :host > wui-icon-box {
        border: none !important;
        background: transparent !important;
      }
    `,
  },
  {
    selector: 'wui-tag',
    marker: 'retro-tag',
    css: `
      :host {
        background: ${RETRO_COLORS.success} !important;
        border: 1px solid ${RETRO_COLORS.borderDark} !important;
        padding: 1px 4px !important;
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
        font-size: 9px !important;
        color: ${RETRO_COLORS.titleText} !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
    `,
  },
  {
    selector: 'wui-search-bar',
    marker: 'retro-search',
    css: `
      :host {
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
      }

      input {
        font-family: inherit !important;
        font-size: 11px !important;
        background: #ffffff !important;
        color: ${RETRO_COLORS.text} !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderMid} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderMid} !important;
        padding: 3px 6px !important;
        box-shadow: inset 1px 1px 0 ${RETRO_COLORS.borderDark} !important;
      }

      input::placeholder {
        color: ${RETRO_COLORS.textMuted} !important;
      }

      wui-icon {
        color: ${RETRO_COLORS.text} !important;
        border-radius: 0 !important;
      }
    `,
  },
  {
    selector: 'w3m-input-token',
    marker: 'retro-input-token',
    css: `
      * {
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
      }

      wui-button,
      wui-button *,
      wui-button button {
        border-radius: 0px !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-bottom-left-radius: 0px !important;
        border-bottom-right-radius: 0px !important;
      }
    `,
  },
  {
    selector: 'wui-text',
    marker: 'retro-text',
    css: `
      :host {
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
        font-size: 11px !important;
        line-height: 1.3 !important;
        color: ${RETRO_COLORS.text} !important;
        background: transparent !important;
      }

      span {
        background: transparent !important;
      }
    `,
  },
  {
    selector: 'wui-tabs',
    marker: 'retro-tabs',
    css: `
      :host {
        background: ${RETRO_COLORS.window} !important;
        border-bottom: 2px solid ${RETRO_COLORS.borderMid} !important;
        padding: 0 !important;
        gap: 0 !important;
      }

      button {
        font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
        font-size: 11px !important;
        background: ${RETRO_COLORS.windowAlt} !important;
        border: 2px solid !important;
        border-color: ${RETRO_COLORS.borderLight} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderDark} ${RETRO_COLORS.borderLight} !important;
        border-bottom: none !important;
        color: ${RETRO_COLORS.text} !important;
        padding: 4px 12px !important;
        margin-right: 2px !important;
        position: relative !important;
        top: 2px !important;
      }

      button[data-active='true'] {
        background: ${RETRO_COLORS.window} !important;
        border-bottom: 2px solid ${RETRO_COLORS.window} !important;
        top: 2px !important;
        z-index: 1 !important;
      }

      button:hover:not([data-active='true']) {
        background: ${RETRO_COLORS.window} !important;
      }
    `,
  },
  {
    selector: 'wui-icon',
    marker: 'retro-icon',
    css: `
      :host {
        color: inherit !important;
      }

      svg,
      path {
        color: inherit !important;
        fill: currentColor !important;
      }
    `,
  },
  {
    selector: 'wui-avatar',
    marker: 'retro-avatar',
    css: `
      :host {
        margin-top: 12px !important;
        display: block !important;
      }
    `,
  },
  {
    selector: 'wui-visual',
    marker: 'retro-visual',
    css: `
      :host {
        margin-top: 12px !important;
        display: block !important;
      }

      img,
      svg,
      wui-image {
        margin-top: 12px !important;
      }
    `,
  },
  {
    selector: 'wui-image',
    marker: 'retro-image',
    css: `
      :host {
        margin-top: 20px !important;
        display: block !important;
      }

      img {
        margin-top: 20px !important;
      }
    `,
  },
  {
    selector: 'w3m-router',
    marker: 'retro-router',
    css: `
      :host {
        padding-top: 8px !important;
        display: block !important;
      }
    `,
  },
];

function appendStyle(target: ShadowLike, marker: string, css: string) {
  const root = target instanceof ShadowRoot ? target : target.shadowRoot;

  if (!root) {
    requestAnimationFrame(() => appendStyle(target, marker, css));
    return;
  }

  if (root.querySelector(`style[${SHADOW_MARK}="${marker}"]`)) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute(SHADOW_MARK, marker);
  style.textContent = css;
  root.appendChild(style);
}

function styleModal(modal: Element) {
  const shadow = (modal as HTMLElement).shadowRoot;
  if (!shadow) return;

  appendStyle(shadow, 'retro-modal-base', `
    :host {
      background: ${RETRO_COLORS.overlay} !important;
      backdrop-filter: none !important;
      font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif !important;
      border-radius: 0 !important;
    }

    :host(.open) {
      backdrop-filter: none !important;
      border-radius: 0 !important;
    }

    * {
      border-radius: 0px !important;
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
    }

    *::before,
    *::after,
    *:hover,
    *:active,
    *:focus {
      border-radius: 0px !important;
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
      font-family: inherit !important;
      transition: none !important;
      animation: none !important;
    }

    button,
    button *,
    button::before,
    button::after,
    button:hover,
    button:active,
    button:focus,
    button:hover *,
    button:active *,
    button:focus * {
      border-radius: 0px !important;
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
    }

    wui-button,
    wui-button *,
    wui-button button,
    wui-button button *,
    wui-button button::before,
    wui-button button::after,
    wui-button:hover button,
    wui-button:hover button *,
    wui-button button:hover,
    wui-button button:hover * {
      border-radius: 0px !important;
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      border-bottom-left-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
    }

    wui-card {
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0px !important;
      --apkt-spacing-0: 12px !important;
      --apkt-spacing-3: 12px !important;
      --apkt-borderRadius-1: 0px !important;
      --apkt-borderRadius-2: 0px !important;
      --apkt-borderRadius-3: 0px !important;
      --apkt-borderRadius-4: 0px !important;
      --apkt-borderRadius-5: 0px !important;
      --apkt-borderRadius-6: 0px !important;
      --apkt-borderRadius-8: 0px !important;
      --apkt-borderRadius-10: 0px !important;
      --apkt-borderRadius-16: 0px !important;
      --apkt-borderRadius-20: 0px !important;
      --apkt-borderRadius-32: 0px !important;
      --apkt-borderRadius-64: 0px !important;
      --apkt-borderRadius-128: 0px !important;
    }

    w3m-header {
      margin: 0 !important;
      border-radius: 0px !important;
    }

    w3m-router {
      --apkt-spacing-0: 12px !important;
      border-radius: 0px !important;
    }
  `);

  for (const { selector, marker, css } of MODAL_SELECTORS) {
    const elements = Array.from(shadow.querySelectorAll(selector));
    elements.forEach(element => {
      appendStyle(element as HTMLElement, marker, css);
    });
  }

  // Додаткова обробка всіх wui-button для прибирання border-radius
  const allButtons = shadow.querySelectorAll('wui-button');
  allButtons.forEach(button => {
    const buttonShadow = (button as HTMLElement).shadowRoot;
    if (buttonShadow && !buttonShadow.querySelector(`style[${SHADOW_MARK}="retro-button-force"]`)) {
      appendStyle(buttonShadow, 'retro-button-force', `
        *,
        *::before,
        *::after,
        *:hover,
        *:active,
        *:focus {
          border-radius: 0 !important;
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        button,
        button:hover,
        button:active,
        button:focus,
        button::before,
        button::after,
        button:hover::before,
        button:hover::after,
        button *,
        button:hover *,
        button:active *,
        button:focus * {
          border-radius: 0 !important;
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
      `);
    }
  });

  // Прибираємо border-radius з wui-icon-button
  const allIconButtons = shadow.querySelectorAll('wui-icon-button');
  allIconButtons.forEach(button => {
    const buttonShadow = (button as HTMLElement).shadowRoot;
    if (buttonShadow && !buttonShadow.querySelector(`style[${SHADOW_MARK}="retro-icon-button-force"]`)) {
      appendStyle(buttonShadow, 'retro-icon-button-force', `
        *,
        *::before,
        *::after {
          border-radius: 0 !important;
        }
        button,
        button:hover,
        button:active,
        button:focus,
        button::before,
        button::after {
          border-radius: 0 !important;
        }
      `);
    }
  });

  // Прибираємо border-radius з всіх wui-* елементів
  const allWuiElements = shadow.querySelectorAll('[class*="wui-"], wui-card, wui-flex, wui-list-item, wui-wallet-image');
  allWuiElements.forEach(element => {
    const elementShadow = (element as HTMLElement).shadowRoot;
    if (elementShadow && !elementShadow.querySelector(`style[${SHADOW_MARK}="retro-force-square"]`)) {
      appendStyle(elementShadow, 'retro-force-square', `
        *,
        *::before,
        *::after {
          border-radius: 0 !important;
        }
      `);
    }
  });

  // Додаємо відступ для wui-avatar через CSS
  const avatars = shadow.querySelectorAll('wui-avatar');
  avatars.forEach(avatar => {
    (avatar as HTMLElement).style.setProperty('margin-top', '12px', 'important');
    (avatar as HTMLElement).style.setProperty('display', 'block', 'important');
  });

  // ЯДЕРНИЙ ВАРІАНТ: Прямо встановлюємо border-radius: 0 на всі елементи
  const forceSquareCorners = (el: HTMLElement) => {
    if (el.style) {
      el.style.setProperty('border-radius', '0px', 'important');
      el.style.setProperty('border-top-left-radius', '0px', 'important');
      el.style.setProperty('border-top-right-radius', '0px', 'important');
      el.style.setProperty('border-bottom-left-radius', '0px', 'important');
      el.style.setProperty('border-bottom-right-radius', '0px', 'important');
    }
  };

  const processElement = (el: Element) => {
    const htmlEl = el as HTMLElement;
    forceSquareCorners(htmlEl);
    
    // Обробляємо shadow root якщо є
    if (htmlEl.shadowRoot) {
      const shadowElements = htmlEl.shadowRoot.querySelectorAll('*');
      shadowElements.forEach(shadowEl => {
        forceSquareCorners(shadowEl as HTMLElement);
      });
    }
  };

  const allElements = shadow.querySelectorAll('*');
  allElements.forEach(processElement);

  // Створюємо MutationObserver для відстеження змін атрибутів style
  const styleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target as HTMLElement;
        forceSquareCorners(target);
      }
      // Також обробляємо нові елементи
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            processElement(node as Element);
            (node as Element).querySelectorAll('*').forEach(processElement);
          }
        });
      }
    });
  });

  // Спостерігаємо за всіма змінами в shadow DOM
  styleObserver.observe(shadow, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: true,
    subtree: true,
  });

  // Додаємо глобальний обробник для всіх hover подій
  shadow.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target) {
      forceSquareCorners(target);
      // Також обробляємо всі дочірні елементи
      target.querySelectorAll('*').forEach(child => forceSquareCorners(child as HTMLElement));
      
      // Обробляємо shadow root цільового елемента
      if (target.shadowRoot) {
        target.shadowRoot.querySelectorAll('*').forEach(child => forceSquareCorners(child as HTMLElement));
      }
    }
  }, { passive: true, capture: true });

  // Періодично перевіряємо і виправляємо стилі
  const intervalId = setInterval(() => {
    shadow.querySelectorAll('*').forEach(processElement);
  }, 100);

  // Зберігаємо ID інтервалу для можливості очищення
  (shadow as any).__retroStyleInterval = intervalId;

}

function observeShadowRoot(modal: Element) {
  const shadow = (modal as HTMLElement).shadowRoot;
  if (!shadow) return;

  // Перевіряємо чи вже спостерігаємо
  if ((shadow as any).__retroObserver) return;

  const shadowObserver = new MutationObserver(() => {
    styleModal(modal);
  });

  shadowObserver.observe(shadow, {
    childList: true,
    subtree: true,
  });

  (shadow as any).__retroObserver = shadowObserver;
}

export function injectAppKitRetroStyles() {
  if (typeof window === 'undefined') return;

  const globalWindow = window as typeof window & {
    __retroAppKitObserver?: MutationObserver;
  };

  if (globalWindow.__retroAppKitObserver) {
    return;
  }

  const applyStyles = () => {
    const modal =
      document.querySelector('appkit-modal') ||
      document.querySelector('w3m-modal') ||
      document.querySelector('wcm-modal');

    if (modal) {
      styleModal(modal);
      observeShadowRoot(modal);

      // Додатково запускаємо стилізацію через RAF для елементів що з'являються пізніше
      requestAnimationFrame(() => styleModal(modal));
      setTimeout(() => styleModal(modal), 100);
      setTimeout(() => styleModal(modal), 300);
    }
  };

  applyStyles();

  const observer = new MutationObserver(() => applyStyles());
  observer.observe(document.body, { childList: true, subtree: true });

  globalWindow.__retroAppKitObserver = observer;
}
