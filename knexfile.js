module.exports = {
    development: {
      client: 'mysql2',
      connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'trafic'
      },
      migrations: {
        directory: './migrations'
      }
    }
  };
  