import { Resolver, Query, Arg } from "type-graphql";
import prisma from "../prisma/client";
import { Customer } from "../types/customer";

@Resolver(Customer)
export class CustomerResolver {
  @Query(() => [Customer])
  async customers(
    @Arg("filter", { nullable: true }) filter?: string,
    @Arg("sortField", { nullable: true }) sortField?: string,
    @Arg("sortOrder", { nullable: true }) sortOrder: "asc" | "desc" = "asc"
  ): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: filter
        ? {
            OR: [
              { firstname: { contains: filter } },
              { lastname: { contains: filter } },
              { email: { contains: filter } },
            ],
          }
        : undefined,
      orderBy: sortField ? { [sortField]: sortOrder } : undefined,
    });
  }
}
