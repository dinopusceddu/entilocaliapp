import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Un componente di test banale per verificare jsdom + rtl
const DummyComponent = () => <div>Bootstrap Test Success</div>;

describe('Bootstrap Test', () => {
  it('should render correctly in jsdom environment', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Bootstrap Test Success')).toBeInTheDocument();
  });
});
