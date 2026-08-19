import { useEffect } from 'react';
import type { CSSProperties } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';
const REVEALED_CLASS = 'is-revealed';

function isRevealElement(node: EventTarget | null): node is HTMLElement {
  return node instanceof HTMLElement && node.hasAttribute('data-reveal');
}

export function useScrollReveal() {
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !isRevealElement(entry.target)) {
            return;
          }

          entry.target.classList.add(REVEALED_CLASS);
          intersectionObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    const observeElement = (element: Element) => {
      if (!isRevealElement(element) || element.classList.contains(REVEALED_CLASS)) {
        return;
      }

      if (motionQuery.matches) {
        element.classList.add(REVEALED_CLASS);
        return;
      }

      intersectionObserver.observe(element);
    };

    const observeTree = (node: ParentNode) => {
      if (node instanceof Element) {
        observeElement(node);
      }

      node.querySelectorAll(REVEAL_SELECTOR).forEach(observeElement);
    };

    observeTree(root);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            observeTree(node);
          }
        });
      });
    });

    mutationObserver.observe(root, { childList: true, subtree: true });

    const revealAll = () => {
      root.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
        element.classList.add(REVEALED_CLASS);
        intersectionObserver.unobserve(element);
      });
    };

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        revealAll();
      }
    };

    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
}

export function getRevealDelayStyle(index: number, stepMs = 90): CSSProperties {
  return {
    '--reveal-delay': `${index * stepMs}ms`,
  } as CSSProperties;
}
