// app/page.tsx
// Route group re-export to ensure a single root (/) page.
// This keeps the new Lore UI landing implemented in app/(site)/page.tsx as the homepage.
export { default } from "./(site)/page";
