export const loader = async () => {
  return new Response(
    "❌ No puedes ejecutar migraciones en Vercel. Hazlas local y sube el código.",
    { status: 400 }
  );
};
