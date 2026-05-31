interface PaginateOptions<TWhere, TInclude, TOrderBy> {
  page?: number;
  limit?: number;
  where?: TWhere;
  include?: TInclude;
  orderBy?: TOrderBy;
}

async function prismaPaginate<T>(
  model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  options: PaginateOptions<any, any, any>,
) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    model.findMany({
      where: options.where,
      include: options.include,
      orderBy: options.orderBy,
      skip,
      take: limit,
    }),
    model.count({
      where: options.where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      total,          // umumiy count (filter bo‘yicha)
      count: items.length, // hozirgi page dagi elementlar soni
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export default prismaPaginate;