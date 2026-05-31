
function pickFields<T extends object>(
    obj: T,
    fields: string[],
) {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([key, value]) =>
                fields.includes(key) && value !== undefined,
        ),
    );
}

export default pickFields;