exports.up = function(knex) {
    return knex.schema.createTable('regions', function(table) {
      table.increments('id'); // Primary key
      table.string('acronym');
      table.boolean('rowStatus');
      table.string('name');
      table.string('ipUrl');
      table.string('portNumber');
      table.string('smsNumber');
      table.string('logoAdress');
      table.string('language');
      table.timestamps(true, true); // Adds created_at and updated_at
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('regions');
  };
  