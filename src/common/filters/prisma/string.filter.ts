const contains = (value?: string) => (value ? { contains: value, mode: 'insensitive' as const } : undefined);

export default contains;
