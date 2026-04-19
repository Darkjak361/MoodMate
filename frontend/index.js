/**
 * 🛡️⚓️🚀 MoodMate: Industrial SSR Shield
 * Absolute Entry Point - This must load BEFORE any other package.
 * 1,000,000% Stability for Humber Capstone Presentation.
 */

// 🛡️ Safe SSR Detection (Strictly for Node.js Bundling/Rendering - NO NATIVE IMPACT)
const isNodeSSR = typeof process !== 'undefined' && 
                  process.release && 
                  process.release.name === 'node' && 
                  typeof window === 'undefined';

if (isNodeSSR) {
  // 1000% Safe Polyfill Engine
  const safePolyfill = (name, value) => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(global, name);
      if (descriptor && !descriptor.configurable) return;

      Object.defineProperty(global, name, {
        value: value,
        configurable: true,
        writable: true
      });
    } catch (e) {}
  };

  // 1. Critical Base Polyfills
  try { global.window = global.window || {}; } catch (e) {}
  
  // 2. Storage Polyfills (Immediate priority)
  try {
    const mockStorage = {
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null,
      clear: () => null,
      length: 0,
      key: () => null,
    };
    safePolyfill('localStorage', mockStorage);
    safePolyfill('sessionStorage', mockStorage);
  } catch (e) {}

  // 3. Platform Polyfill (Fixes "Platform is not defined" industrial crash)
  try {
    safePolyfill('Platform', {
      OS: 'web',
      select: (obj) => obj.web || obj.default,
      Version: 1,
      isTesting: false,
    });
  } catch (e) {}

  // 4. BOM/DOM Polyfills
  try {
    safePolyfill('document', {
      querySelector: () => null,
      createElement: () => ({ style: {}, appendChild: () => {} }),
      getElementsByTagName: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  } catch (e) {}

  // 5. Case-by-case Navigator handling
  try {
    if (typeof global.navigator === 'undefined') {
      safePolyfill('navigator', { userAgent: 'MoodMate Industrial Shield' });
    } else if (!global.navigator.userAgent) {
      const desc = Object.getOwnPropertyDescriptor(global, 'navigator');
      if (desc && desc.configurable) {
        global.navigator.userAgent = 'MoodMate Industrial Shield';
      }
    }
  } catch (e) {}
}

// 🚀 Launch Original Expo Entry
require('expo-router/entry');
