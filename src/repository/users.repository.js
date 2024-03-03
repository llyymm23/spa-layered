import { prisma } from "../../models/index.js";

export class UsersRepository {
    findUserByEmail = async (email) => {
        const user = await prisma.users.findFirst({
            where: { email },
        });
        return user;
    }

    createUser = async (email, hashedPassword, name) => {
        const user = await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        return user;
    }

    findUserById = async (userId) => {
        const user = await prisma.users.findFirst({
            where: { userId: +userId },
            select: {
                userId: true,
                email: true,
                name: true,
            },
        });

        return user;
    }
}