const { registerUser, loginUser } = require('../../src/auth');

describe('Authentication Layer - Commit Stage Unit Tests', () => {
  const mockDb = {
    findUserByUsername: jest.fn(),
    saveUser: jest.fn()
  };

  const mockCrypto = {
    hash: jest.fn((pwd) => `hashed_${pwd}`),
    compare: jest.fn((pwd, hashed) => `hashed_${pwd}` === hashed)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully hash a password and save user on registration', async () => {
    mockDb.findUserByUsername.mockReturnValue(null); // User does not exist
    const payload = { username: 'dev_user', password: 'securePassword123' };

    const result = await registerUser(mockDb, mockCrypto, payload);

    expect(mockCrypto.hash).toHaveBeenCalledWith('securePassword123');
    expect(mockDb.saveUser).toHaveBeenCalledWith({
      username: 'dev_user',
      password: 'hashed_securePassword123'
    });
    expect(result.success).toBe(true);
  });

  it('should reject registration if the username is already taken', async () => {
    mockDb.findUserByUsername.mockReturnValue({ username: 'dev_user' }); // User exists
    const payload = { username: 'dev_user', password: 'password' };

    await expect(registerUser(mockDb, mockCrypto, payload))
      .rejects.toThrow('Username already exists');
    
    expect(mockDb.saveUser).not.toHaveBeenCalled();
  });

  it('should authenticate a valid user and return a token session payload', async () => {
    mockDb.findUserByUsername.mockReturnValue({ username: 'dev_user', password: 'hashed_secret' });
    
    const session = await loginUser(mockDb, mockCrypto, 'dev_user', 'secret');
    expect(session.token).toBeDefined();

    await expect(loginUser(mockDb, mockCrypto, 'dev_user', 'wrong_password'))
      .rejects.toThrow('Invalid credentials');
  });
});
