import { RequestHandler } from "express";

const FORBIDDEN_FIELDS = [
  "active",
  "company",
  "route",
  "_id",
];

export const rejectLegacyFields: RequestHandler = (req, res, next) => {
  const payload = req.body;

  if (!payload || typeof payload !== "object") {
    return next();
  }

  const found = FORBIDDEN_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field)
  );

  if (found.length > 0) {
    return res.status(400).json({
      message: "Payload contiene campos legacy no permitidos",
      forbiddenFields: found,
      hint:
        "Usa isActive, companyId, routeId y deja que el backend genere id",
    });
  }

  next();
};
