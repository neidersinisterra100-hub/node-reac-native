import { RequestHandler } from "express";

/**
 * 🔒 Bloquea campos legacy que NO deben entrar nunca más
 * Evita que web / mobile / clientes viejos rompan la cascada
 */
export const blockLegacyFields: RequestHandler = (req, res, next) => {
  const forbiddenFields = ["active", "company", "route"];

  const found = forbiddenFields.filter((f) => f in req.body);

  if (found.length > 0) {
    return res.status(400).json({
      message: "Payload inválido (campos legacy detectados)",
      forbiddenFields: found,
      expectedFields: ["companyId", "routeId", "isActive"],
    });
  }

  next();
};
