import bcrypt from 'bcrypt';



export const hashValue = async (value: string, saltRounds?: number): Promise<string> => {
    const hashed = bcrypt.hash(value, saltRounds || 10);
    return hashed;
}

export const compareValue = async (value: string, hashedValue: string) => {
    bcrypt.compare(value, hashedValue).catch(() => false);
}