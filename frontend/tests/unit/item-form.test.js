import { render, screen, fireEvent } from '@testing-library/react';
import ItemForm from '../../src/ItemForm';

describe('Frontend Form UI - Commit Stage Unit Tests', () => {
  it('should catch validation errors before submitting to the API', () => {
    const mockSubmit = jest.fn();
    render(<ItemForm onSubmit={mockSubmit} />);
    
    // Attempt to submit an empty form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});