exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
      table.increments('id'); // Primary key
      table.string('email');
      table.string('password');
      table.timestamps(true, true); // Adds created_at and updated_at
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };
  