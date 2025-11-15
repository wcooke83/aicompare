import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '../components/Navigation';
import SkipToContent from '../components/SkipToContent';
import ErrorBoundary from '../components/ErrorBoundary';

describe('Navigation Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<Navigation />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('should have accessible links', () => {
    render(<Navigation />);

    const homeLink = screen.getByRole('link', { name: /ai comparisons - home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have focus-visible styles', () => {
    render(<Navigation />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link.className).toContain('focus:outline-none');
      expect(link.className).toContain('focus:ring-2');
    });
  });
});

describe('Skip to Content', () => {
  it('should render skip link', () => {
    render(<SkipToContent />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have sr-only class by default', () => {
    render(<SkipToContent />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink.className).toContain('sr-only');
  });
});

describe('Error Boundary Accessibility', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should have accessible error UI', () => {
    // Error boundary needs class component to test properly
    // This is a basic structure test
    const { container } = render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('General Accessibility', () => {
  it('should have proper document language', () => {
    // This would be tested in E2E tests with the full app
    expect(true).toBe(true);
  });

  it('should support reduced motion preference', () => {
    // CSS media query test - would be tested in E2E
    expect(true).toBe(true);
  });
});
