 
  /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('admins', function(table) {
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('chat_id').unique().notNullable(); 
        table.string('lastName').notNullable();
        table.string('phone').notNullable();
        table.string('email').notNullable();
        table.text('role').notNullable();
        table.enu('status', [1,0]).defaultTo(1);
        table.timestamps(true, true);
        table.string('username').unique().notNullable(); 
    
       });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('admins');
  };
  