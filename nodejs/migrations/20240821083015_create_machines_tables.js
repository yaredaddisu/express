 
  /**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
  exports.up = function(knex) {
    return knex.schema.createTable('machines', function(table) {
        table.increments('id').primary();
        table.string('machineName').notNullable();
        table.string('chat_id').notNullable(); 
        table.string('machineShortCode').notNullable();
 
        table.enu('status', [1,0]).defaultTo(1);
        table.timestamps(true, true);
         
       });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('machines');
  };
  