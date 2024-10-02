exports.up = function(knex) {
    return knex.schema
      .createTable('technicians', function(table) {
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('chat_id').unique().notNullable(); // Creates a unique string column named 'chat_id'
        table.string('lastName').notNullable();
        table.string('phone').notNullable();
        table.string('email').notNullable();
        table.text('skills').notNullable();
        table.integer('experience').notNullable();
        table.enu('status', [1,0]).defaultTo(1);
        table.timestamps(true, true);
        table.string('username').unique().notNullable(); // Creates a unique string column named 'chat_id'


      })
      // .createTable('jobs', function(table) {
      //   table.increments('id').primary();
      //   table.string('chat_id'); // Creates a unique string column named 'chat_id'
      //   table.integer('customer_id');
      //   table.string('service_type');
      //   table.text('location');
      //   table.text('description');
      //   table.integer('employee_id').unsigned();
      //   table.foreign('employee_id').references('employees.id').onDelete('CASCADE').onUpdate('CASCADE');        table.enu('status', [0, 2,1]).defaultTo(0);

      //   table.timestamps(true, true);

      //   // table.enu('status', ['pending', 'in progress', 'completed']).defaultTo('pending');
      // });
  };
  
  exports.down = function(knex) {
    return knex.schema
      // .dropTable('jobs')
      .dropTable('technicians');
  };
  