import { ResumeRepository } from "../repository/resume.repository.js";

export class ResumeService {

    resumeRepository = new ResumeRepository();

    //이력서 목록 조회 API
    getResumes = async (orderKey, orderValue) => {
        const resumes = await this.resumeRepository.getResumes(orderKey, orderValue);

        return resumes;
    }

    //이력서 상세 조회 API
    getResume = async (resumeId) => {
        const resume = await this.resumeRepository.getResume(resumeId);

        if (!resume) {
            throw {
                code: 404,
                message: "이력서 조회에 실패하였습니다."
            };
        }

        return resume;
    }

    //이력서 생성 API
    createResume = async (title, introduction, userId, name) => {
        const resume = await this.resumeRepository.createResume(title, introduction, userId, name);

        return resume;
    }

    //이력서 가져오기 
    findResumeById = async (resumeId) => {
        const resume = await this.resumeRepository.findResumeById(resumeId);

        if (!resume) {
            throw {
                code: 404,
                message: "이력서 조회에 실패하였습니다."
            };
        }

        return resume;
    }

    //이력서 수정 API
    patchResume = async (resumeId, updatedData) => {
        const resume = await this.resumeRepository.patchResume(resumeId, updatedData);

        return resume;
    }

    //이력서 삭제 API
    deleteResume = async (resumeId) => {
        const resume = await this.resumeRepository.deleteResume(resumeId);

        return resume;
    }

}