import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../../src/LoginForm';

describe('Frontend Form Interface - Commit Stage Unit Tests', () => {
  it('should display validation warnings natively if the credentials inputs are blank', () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Fire submittal without entering data values
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/fields cannot be empty/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
