 
  /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
  exports.up = function(knex) {
    return knex.schema.createTable('locations', function(table) {
        table.increments('id').primary();
        table.string('LocationName').notNullable();
        table.string('chat_id').notNullable(); 
        table.string('LocationShortCode').notNullable();
 
        table.enu('status', [1,0]).defaultTo(1);
        table.timestamps(true, true);
         
       });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('locations');
  };
  