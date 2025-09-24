import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AppIcon from '../AppIcon';

describe('AppIcon', () => {
  it('should render successfully', () => {
    const { container } = render(<AppIcon />);
    expect(container).toBeDefined();
  });

  it('should render with custom className', () => {
    const { container } = render(<AppIcon className="custom-class" />);
    const icon = container.firstChild;
    expect(icon).toHaveClass('custom-class');
  });

  it('should render with default size', () => {
    const { container } = render(<AppIcon />);
    const icon = container.firstChild;
    expect(icon).toBeDefined();
  });
});