async function registerUser(db, crypto, { username, password }) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const existingUser = await db.findUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await crypto.hash(password);
  await db.saveUser({ username, password: hashedPassword });

  return { success: true };
}

async function loginUser(db, crypto, username, password) {
  const user = await db.findUserByUsername(username);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await crypto.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate stateless session payload identifier (JWT mockup)
  return {
    success: true,
    token: `ey-mock-session-token-for-${username}`
  };
}

module.exports = { registerUser, loginUser };
