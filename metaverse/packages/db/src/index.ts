import { PrismaClient } from "@prisma/client";
export default new PrismaClient();
// we are exporting the prisma client from the node modules in the db so that we can use it in apps