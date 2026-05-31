const numberRange = (
    min?: number,
    max?: number
) => {
    if (min === undefined && max === undefined) return undefined;

    return {
        ...(min !== undefined && { gte: min }),
        ...(max !== undefined && { lte: max }),
    };
};


export default numberRange;