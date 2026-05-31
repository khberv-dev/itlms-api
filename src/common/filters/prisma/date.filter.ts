const dateRange = (
    from?: Date | string,
    to?: Date | string
) => {
    if (!from && !to) return undefined;

    return {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
    };
};

export default dateRange;