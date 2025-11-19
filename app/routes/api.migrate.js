import { exec } from "node:child_process";

export const loader = async () => {
  return await new Promise((resolve) => {
    exec("npx prisma migrate deploy", (error, stdout, stderr) => {
      if (error) {
        resolve(new Response("Error: " + stderr, { status: 500 }));
      } else {
        resolve(new Response("OK: " + stdout, { status: 200 }));
      }
    });
  });
};
