import { userRouter } from "./routers/users";
import { realisedPnlRouter } from "./routers/realisedPnl";
import { investedCashRouter } from "./routers/investedCash";
import { deployedCashRouter } from "./routers/deployedCash";
import { scripsCmpUpdateRouter } from "./routers/admin/scripsCmpUpdate";
import { unrealisedPnlUpdateRouter } from "./routers/admin/unrealisedPnlUpdate";
import { unrealisedPnlRouter } from "./routers/unrealisedPnl";
import { investedAssetsRouter } from "./routers/investedAssets";
import { fileImportRouter } from "./routers/admin/fileParser";
import { portfolioValueRouter } from "./routers/portfolioValue";
import { totalPnlRouter } from "./routers/totalPnl";
import { adminAccSelectionInfoRouter } from "./routers/adminAccSelectionInfo";
import { withdrawnCashRouter } from "./routers/withdrawnCash";
import { todayAlgoPnlRouter } from "./routers/todayAlgoPnl";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  realisedPnl: realisedPnlRouter,
  investedCash: investedCashRouter,
  deployedCash: deployedCashRouter,
  scripsCmpUpdate: scripsCmpUpdateRouter,
  unrealisedPnlUpdate: unrealisedPnlUpdateRouter,
  unrealisedPnl: unrealisedPnlRouter,
  investedAssets: investedAssetsRouter,
  fileImport: fileImportRouter,
  portfolioValue: portfolioValueRouter,
  totalPnl: totalPnlRouter,
  clientsInfo: adminAccSelectionInfoRouter,
  withdrawnCash: withdrawnCashRouter,
  todayAlgoPnl: todayAlgoPnlRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);