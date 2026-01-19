import "dotenv/config";
import prisma from "./client.js";

async function test() {
  try {
    console.log("🟡 Probando conexión Prisma → MongoDB...");

    const result = await prisma.healthCheck.create({
      data: {
        name: "prisma-test",
      },
    });

    console.log("✅ Prisma conectó correctamente");
    console.log("📦 Documento creado:", result);
  } catch (error) {
    console.error("❌ Prisma NO pudo conectar");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
