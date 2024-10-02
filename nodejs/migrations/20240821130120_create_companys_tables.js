 
  /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
  exports.up = function(knex) {
    return knex.schema.createTable('companies', function(table) {
        table.increments('id').primary();
        table.string('CompanyName').notNullable();
        table.string('chat_id').notNullable(); 
        table.string('CompanyShortCode').notNullable();
 
        table.enu('status', [1,0]).defaultTo(1);
        table.timestamps(true, true);
         
       });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('companies');
  };
  