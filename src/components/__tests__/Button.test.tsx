import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button', 'button--primary', 'button--medium');
    expect(button).not.toBeDisabled();
  });

  it('renders with custom variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    
    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('button--secondary');
    expect(button).not.toHaveClass('button--primary');
  });

  it('renders with custom size', () => {
    render(<Button size="large">Large</Button>);
    
    const button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('button--large');
    expect(button).not.toHaveClass('button--medium');
  });

  it('renders in loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button--loading');
    expect(button).toBeDisabled();
    
    // Should show loading text or spinner
    expect(button).toHaveTextContent('Loading...');
  });

  it('renders in disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('button--disabled');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not trigger click when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('button', 'custom-class');
  });

  it('forwards ref to button element', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref test</Button>);
    
    const button = screen.getByRole('button', { name: 'Ref test' });
    expect(ref.current).toBe(button);
  });

  it('passes through HTML button attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });

  describe('variant styles', () => {
    it('applies primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--primary');
    });

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--secondary');
    });

    it('applies outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--outline');
    });

    it('applies ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--ghost');
    });

    it('applies danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--danger');
    });
  });

  describe('size styles', () => {
    it('applies small size', () => {
      render(<Button size="small">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--small');
    });

    it('applies medium size', () => {
      render(<Button size="medium">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--medium');
    });

    it('applies large size', () => {
      render(<Button size="large">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('button--large');
    });
  });

  describe('accessibility', () => {
    it('is focusable by keyboard', () => {
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button', { name: 'Focusable' });
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });

    it('responds to Enter key', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Enter test</Button>);
      
      const button = screen.getByRole('button', { name: 'Enter test' });
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('responds to Space key', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Space test</Button>);
      
      const button = screen.getByRole('button', { name: 'Space test' });
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('indicates loading state to screen readers', () => {
      render(<Button loading>Loading button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('indicates disabled state to screen readers', () => {
      render(<Button disabled>Disabled button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});