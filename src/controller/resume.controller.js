import { ResumeService } from "../service/resume.service.js";

export class ResumeController {

    resumeService = new ResumeService();

    //모든 이력서 조회 API
    getResumes = async (req, res, next) => {
        try {
            const orderKey = req.query.orderKey ?? "resumeId";
            const orderValue = req.query.orderValue ?? "desc";

            if (!["resumeId", "status"].includes(orderKey)) {
                return res.status(400).json({ message: "orderKey가 올바르지 않습니다." });
            }

            if (!["asc", "desc"].includes(orderValue.toLowerCase())) {
                return res
                    .status(400)
                    .json({ message: "orderValue가 올바르지 않습니다." });
            }

            const resumes = await this.resumeService.getResumes(orderKey, orderValue);

            return res.status(200).json({ data: resumes });

        } catch (err) {
            return res.status(err.code).json(err);
        }

    }

    //이력서 상세 조회 API
    getResume = async (req, res, next) => {
        try {
            const { resumeId } = req.params;

            const resume = await this.resumeService.getResume(resumeId);

            return res.status(201).json({ data: resume });

        } catch (err) {
            return res.status(err.code).json(err);
        }

    }

    //이력서 생성 API
    createResume = async (req, res, next) => {
        try {
            const { title, introduction } = req.body;
            const { userId, name } = req.user;

            const resume = await this.resumeService.createResume(title, introduction, userId, name);

            return res.status(201).json({ data: resume });
        } catch (err) {
            return res.status(err.code).json(err);
        }

    }

    //이력서 수정 API
    patchResume = async (req, res, next) => {
        try {
            const { resumeId } = req.params;
            const { userId } = req.user;
            const updatedData = req.body;

            const resume = await this.resumeService.findResumeById(resumeId);

            if (userId !== resume.userId) {
                return res.status(401).json({ message: "이력서 수정 권한이 없습니다." });
            }

            const updatedResume = await this.resumeService.patchResume(resumeId, updatedData);

            return res.status(200).json({ message: "이력서 수정에 성공하였습니다." });

        } catch (err) {
            return res.status(err.code).json(err);
        }

    }

    //이력서 삭제 API
    deleteResume = async (req, res, next) => {
        try {
            const { resumeId } = req.params;
            const { userId } = req.user;

            const resume = await this.resumeService.findResumeById(resumeId);

            if (userId !== resume.userId) {
                return res.status(401).json({ message: "이력서 삭제 권한이 없습니다." });
            }

            const deletedResume = await this.resumeService.deleteResume(resumeId);

            return res.status(200).json({ message: "이력서가 삭제되었습니다." });

        } catch (err) {
            return res.status(err.code).json(err);
        }

    }

}