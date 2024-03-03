import { prisma } from "../../models/index.js";

export class ResumeRepository {

    //이력서 목록 조회 API
    getResumes = async (orderKey, orderValue) => {
        const resumes = await prisma.resume.findMany({
            select: {
                resumeId: true,
                title: true,
                introduction: true,
                name: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                [orderKey]: orderValue.toLowerCase(),
            },
        });
        return resumes;
    }

    //이력서 상세 조회 API
    getResume = async (resumeId) => {
        const resume = await prisma.resume.findFirst({
            where: { resumeId: +resumeId },
            select: {
                resumeId: true,
                title: true,
                introduction: true,
                name: true,
                status: true,
                createdAt: true,
            },
        });
        return resume;
    }

    //이력서 생성 API
    createResume = async (title, introduction, userId, name) => {
        const resume = await prisma.resume.create({
            data: {
                userId: +userId,
                title,
                name: name,
                introduction,
            },
        });
        return resume;
    }

    //이력서 가져오기
    findResumeById = async (resumeId) => {
        const resume = await prisma.resume.findFirst({
            where: { resumeId: +resumeId }
        });
        return resume;
    }

    //이력서 수정 API
    patchResume = async (resumeId, updatedData) => {
        const resume = await prisma.resume.update({
            data: {
                ...updatedData,
            },
            where: {
                resumeId: +resumeId,
            },
        });
        return resume;
    }

    //이력서 삭제 API
    deleteResume = async (resumeId) => {
        const del = await prisma.resume.delete({
            where: { resumeId: +resumeId },
        });

        return del;
    }
}