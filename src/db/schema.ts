import { pgTable, integer, text, varchar, boolean, real, primaryKey } from 'drizzle-orm/pg-core';

export const states = pgTable('states', {
  stateId: integer('state_id').primaryKey(),              // world ID
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull(),
  summary: text('summary'),                                // short blurb
  heraldrySvgUrl: text('heraldry_svg_url'),                // /assets/heraldry/state/12.svg
});

export const provinces = pgTable('provinces', {
  stateId: integer('state_id').notNull().references(()=>states.stateId),
  provinceId: integer('province_id').notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull(),
  summary: text('summary'),
}, (t) => ({ pk: primaryKey({ columns: [t.stateId, t.provinceId] }) }));

export const burgs = pgTable('burgs', {
  burgId: integer('burg_id').primaryKey(),
  stateId: integer('state_id').notNull().references(()=>states.stateId),
  provinceId: integer('province_id').notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  kind: varchar('kind', { length: 16 }).notNull(),         // city|town|village
  population: integer('population'),
  lat: real('lat'), lon: real('lon'),
  citySvgUrl: text('city_svg_url'),
  villageSvgUrl: text('village_svg_url'),
  watabouUrl: text('watabou_url'),
});

export const markers = pgTable('markers', {
  id: integer('id').primaryKey(),                          // marker id from export
  name: varchar('name', { length: 128 }).notNull(),
  type: varchar('type', { length: 64 }).notNull(),
  description: text('description'),
  runeHtml: text('rune_html'),                             // for obelisks/stele inscriptions
  stateId: integer('state_id'),
  provinceId: integer('province_id'),
  burgId: integer('burg_id'),
});
