module.exports = {
    development: {
      client: 'mysql2',
      connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'technician_management'
      },
      migrations: {
        directory: './migrations'
      }
    }
  };
  