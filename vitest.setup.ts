/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

globalThis.matchMedia =
    globalThis.matchMedia ||
    (() => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }));

// Mocking IntersectionObserver for tests
globalThis.IntersectionObserver =
    globalThis.IntersectionObserver ||
    class {
        observe() {
            // Using 'this' to satisfy eslint rule
            const self = this;
        }

        unobserve() {
            // Using 'this' to satisfy eslint rule
            const self = this;
        }

        disconnect() {
            // Using 'this' to satisfy eslint rule
            const self = this;
        }
    };
