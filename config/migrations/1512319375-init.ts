import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // await knex.schema.createTable('tenants', (table: Knex.CreateTableBuilder) => {
  //   table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

  //   table.text('title');
  //   table.text('address');
  //   table.text('timezone');

  //   table.boolean('enabled').defaultTo(true);
  //   table.boolean('deleted').defaultTo(false);

  //   table.timestamps();
  // });

  await knex.schema.createTable('users', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('tenant_id');
    table.foreign('tenant_id').references('tenants.id').onDelete('CASCADE');

    table.text('first_name');
    table.text('last_name');
    table.text('email');
    table.text('phone_number');
    table.text('address');
    table.text('city');
    table.text('state');
    table.text('zip');
    table.text('timezone');
    table.text('role').defaultTo('user');
    table.boolean('enabled').defaultTo(true);
    table.boolean('deleted').defaultTo(false);
    table.text('stripe_id');

    table.timestamps();
  });

  // await knex.schema.table('tenants', (table: Knex.AlterTableBuilder) => {
  //   table.uuid('created_by_id');
  //   table.foreign('created_by_id').references('users.id').onDelete('CASCADE');
  // });
}

export async function down(knex: Knex) {
  await knex.schema.table('users', (t) => t.dropForeign([ 'tenant_id' ]));
  // await knex.schema.table('tenants', (t) => t.dropForeign([ 'created_by_id' ]));

  // await knex.schema.dropTable('tenants');
  await knex.schema.dropTable('users');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
