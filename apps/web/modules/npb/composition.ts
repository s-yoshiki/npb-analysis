import "server-only";

import { NpbQueryService } from "./application/npb-query-service";
import { sqliteNpbReadRepository } from "./infrastructure/sqlite/sqlite-npb-read-repository";

/** Composition Root: ApplicationのポートへSQLite Adapterを注入する。 */
export const npbQueryService = new NpbQueryService(sqliteNpbReadRepository);
