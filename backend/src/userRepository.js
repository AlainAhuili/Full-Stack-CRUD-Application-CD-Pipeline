class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // CREATE: Insert a new user record
  async create({ name, email }) {
    const query = `
      INSERT INTO users (name, email) 
      VALUES ($1, $2) 
      RETURNING id, name, email, created_at;
    `;
    const values = [name, email];
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  // READ: Fetch all user records
  async findAll() {
    const query = 'SELECT id, name, email, created_at FROM users ORDER BY id ASC;';
    const { rows } = await this.pool.query(query);
    return rows;
  }
}

module.exports = UserRepository;