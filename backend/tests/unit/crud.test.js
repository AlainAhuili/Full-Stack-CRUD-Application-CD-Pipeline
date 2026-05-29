const { createRecord } = require('../../src/logic');

describe('CRUD Logic - Commit Stage Unit Tests', () => {
  it('should validate and create a record without hitting a database', () => {
    // Arrange: Mock database dependency entirely
    const mockDb = {
      save: jest.fn().mockReturnValue({ id: 1, name: 'Valid Item' })
    };
    const newItem = { name: 'Valid Item' };

    // Act
    const result = createRecord(mockDb, newItem);

    // Assert
    expect(mockDb.save).toHaveBeenCalledWith(newItem);
    expect(result.id).toBe(1);
  });

  it('should reject creation if payload is invalid', () => {
    const mockDb = { save: jest.fn() };
    const invalidItem = { name: '' };

    expect(() => createRecord(mockDb, invalidItem)).toThrow('Validation Failed');
    expect(mockDb.save).not.toHaveBeenCalled();
  });
});