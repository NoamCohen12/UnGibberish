// content-script.js
(function () {
  const TEXTAREA_SELECTORS = [
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Send a message"]',
    'textarea',
    'div[contenteditable="true"]'
  ];

  const OVERLAY_ID = "ug-overlay";

  function findChatEditable() {
    const focused = document.activeElement;
    if (focused && (focused.tagName === 'TEXTAREA' || focused.isContentEditable || focused.tagName === 'INPUT')) {
      return focused;
    }
    const candidates = Array.from(document.querySelectorAll(TEXTAREA_SELECTORS.join(',')));
    if (!candidates.length) return null;
    return candidates.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0];
  }

  let lastEditable = null;
  let lastSelection = null;

  function ensureOverlayButton() {
    let btn = document.getElementById(OVERLAY_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Fix keyboard layout (Ctrl/Cmd+Alt+L)';
      btn.textContent = 'אבג→ABC';
      btn.id = OVERLAY_ID;

      // לא מגדירים שום inline styles של מיקום!
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', applyFixToActiveInput);

      // חשוב: להצמיד ל-body כדי ש-position: fixed יעבוד יציב
      (document.body || document.documentElement).appendChild(btn);
    }
    // ⚠️ לא לקרוא ל-positionOverlayButton כאן
  }

  // ⚠️ מוחקים/מנטרלים את הפונקציה שממקמת עם top/left
  // function positionOverlayButton(btn) { ... }  // לא בשימוש

  function replaceInContentEditable(target, fixedText) {
    const sel = window.getSelection();
    if (!sel) return;
  
    if (sel.rangeCount > 0 && !sel.isCollapsed) {
      // יש בחירה – מחליפים את הטקסט הנבחר
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(fixedText));
  
      // לשים את הסמן אחרי הטקסט שהוכנס
      sel.removeAllRanges();
      const caret = document.createRange();
      caret.selectNodeContents(target);
      caret.collapse(false);
      sel.addRange(caret);
    } else {
      // אין בחירה – מחליפים את כל התוכן
      target.textContent = fixedText;
  
      const caret = document.createRange();
      caret.selectNodeContents(target);
      caret.collapse(false);
      sel.removeAllRanges();
      sel.addRange(caret);
    }
  
    // ליידע פריימוורקים (React/SPA) שמשהו השתנה
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
  

  function applyFixToActiveInput() {
    const target = lastEditable || findChatEditable();
    if (!target) return;
    const fix = (txt) => (window.UnGibberish?.fixLayout(txt) ?? txt);
    if (typeof target.focus === 'function') target.focus();

    if (target.isContentEditable) {
      const sel = window.getSelection();
      const hasSelection = sel && !sel.isCollapsed;
      const original = hasSelection ? sel.toString() : (target.textContent || '');
      const fixed = fix(original);
      replaceInContentEditable(target, fixed);
      return;
    }

    const start = (lastEditable === target && lastSelection) ? lastSelection.start : (target.selectionStart ?? 0);
    const end   = (lastEditable === target && lastSelection) ? lastSelection.end   : (target.selectionEnd   ?? 0);
    const value = target.value ?? '';
    const selected = start !== end ? value.slice(start, end) : value;
    const fixed = fix(selected);

    if (start !== end) {
      target.setRangeText(fixed, start, end, 'end');
    } else {
      target.value = fixed;
    }
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // קיצור מקלדת: Ctrl/Cmd + Alt + L
  function handleKeydown(e) {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
    if (ctrlOrCmd && e.altKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      applyFixToActiveInput();
    }
  }

  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg?.type === 'UG_FIX_LAYOUT') applyFixToActiveInput();
  });

  // משאירים observer רק כדי לוודא שהכפתור קיים (לא למקם אותו)
  const observer = new MutationObserver(() => ensureOverlayButton());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // לא צריך למקם ב-resize; אם בכל זאת תרצה לוודא קיום:
  window.addEventListener('resize', () => ensureOverlayButton(), true);
  window.addEventListener('keydown', handleKeydown, true);

  window.addEventListener('focusin', (e) => {
    const t = e.target;
    if (!t) return;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable) {
      lastEditable = t;
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') {
        try { lastSelection = { start: t.selectionStart ?? 0, end: t.selectionEnd ?? 0 }; }
        catch (_) { lastSelection = null; }
      } else {
        lastSelection = null;
      }
    }
  }, true);

  window.addEventListener('selectionchange', () => {
    if (!lastEditable) return;
    if (lastEditable.tagName === 'TEXTAREA' || lastEditable.tagName === 'INPUT') {
      try { lastSelection = { start: lastEditable.selectionStart ?? 0, end: lastEditable.selectionEnd ?? 0 }; }
      catch (_) { /* noop */ }
    }
  }, true);

  ensureOverlayButton();
})();
