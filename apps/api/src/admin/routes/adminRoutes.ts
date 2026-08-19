import { UserRole } from "@prisma/client";
import { FastifyInstance } from "fastify";
import {
  getAdminPlans,
  getDashboard,
  getPreRegistrations,
  patchPlanActive,
  postConvertPreRegistration,
} from "../controllers/adminController";
import { authenticate, requireRole } from "../../auth/middleware/authenticate";

const adminGuard = [authenticate, requireRole(UserRole.ADMIN)];

export async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/dashboard", { preHandler: adminGuard }, getDashboard);

  app.get(
    "/admin/pre-registrations",
    { preHandler: adminGuard },
    getPreRegistrations,
  );
  app.get("/admin/plans", { preHandler: adminGuard }, getAdminPlans);

  app.patch(
    "/admin/plans/:planId/toggle-active",
    { preHandler: adminGuard },
    patchPlanActive,
  );

  app.post(
    "/admin/pre-registrations/:id/convert",
    { preHandler: adminGuard },
    postConvertPreRegistration,
  );
}
