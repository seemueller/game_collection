import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Overlay from './Overlay';

function renderOverlay(props = {}) {
  const defaultProps = {
    show: true,
    icon: '\u{1F389}',
    title: 'Super gemacht!',
    text: 'Du hast gewonnen!',
    onAction: vi.fn(),
    ...props,
  };

  const result = render(
    <MemoryRouter>
      <Overlay {...defaultProps} />
    </MemoryRouter>
  );

  return { ...result, onAction: defaultProps.onAction };
}

describe('Overlay', () => {
  it('renders with active class when show is true', () => {
    const { container } = renderOverlay({ show: true });
    const overlay = container.querySelector('.overlay');
    expect(overlay.classList.contains('active')).toBe(true);
  });

  it('renders without active class when show is false', () => {
    const { container } = renderOverlay({ show: false });
    const overlay = container.querySelector('.overlay');
    expect(overlay.classList.contains('active')).toBe(false);
  });

  it('displays the icon', () => {
    const { container } = renderOverlay({ icon: '\u{1F3C6}' });
    expect(container.querySelector('.overlay-icon').textContent).toBe('\u{1F3C6}');
  });

  it('displays the title', () => {
    const { container } = renderOverlay({ title: 'Testtitel' });
    expect(container.querySelector('.overlay-title').textContent).toBe('Testtitel');
  });

  it('displays the text', () => {
    const { container } = renderOverlay({ text: 'Ein Testtext' });
    expect(container.querySelector('.overlay-text').textContent).toBe('Ein Testtext');
  });

  it('displays extra content when provided', () => {
    const { container } = renderOverlay({ extra: '\u2B50\u2B50\u2B50' });
    const overlayContent = container.querySelector('.overlay-content');
    expect(overlayContent.textContent).toContain('\u2B50\u2B50\u2B50');
  });

  it('does not render extra content when not provided', () => {
    const { container } = renderOverlay({ extra: undefined });
    const overlayContent = container.querySelector('.overlay-content');
    // icon + title + text + buttons = 4 children (no extra div)
    expect(overlayContent.children).toHaveLength(4);
  });

  it('calls onAction when "Nochmal spielen" is clicked', async () => {
    const user = userEvent.setup();
    const { container, onAction } = renderOverlay();

    const btn = container.querySelector('.btn.btn-green');
    await user.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('has a link to the homepage', () => {
    const { container } = renderOverlay();
    const link = container.querySelector('.btn.btn-blue');
    expect(link.getAttribute('href')).toBe('/');
    expect(link.textContent).toBe('Zur Startseite');
  });
});
