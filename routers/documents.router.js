import express from "express";
import { prisma } from "../models/index.js";
import authMiddleware from "../middlewares/need-signin.middlewares.js";

const router = express.Router();

// ### 인증 기능 추가
// - 인증 필요 API 호출 시 **Request Header**의 ****Authorization 값으로 **JWT**를 함께 넘겨줘야 합니다.
// - 인증에 실패한 경우, 알맞은 **Http Status Code**와 **로그인이 필요합니다** 라는 에러 메세지를 반환합니다.

// ### 모든 이력서 목록 조회 API
// - 이력서 ID, 이력서 제목, 자기소개, 작성자명, 이력서 상태, 작성 날짜 조회하기 (여러건)
//     - 작성자명을 표시하기 위해서는 이력서 테이블과 사용자 테이블의 JOIN이 필요합니다.
// - 이력서 목록은 QueryString으로 order 데이터를 받아서 정렬 방식을 결정합니다.
//     - orderKey, orderValue 를 넘겨받습니다.
//     - orderValue에 들어올 수 있는 값은 ASC, DESC 두가지 값으로 대소문자 구분을 하지 않습니다.
//     - ASC는 과거순, DESC는 최신순 그리고 둘 다 해당하지 않거나 값이 없는 경우에는 최신순 정렬을 합니다.
//     - 예시 데이터 : `orderKey=userId&orderValue=desc`
router.get("/resumes", async (req, res, next) => {
  try {
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
        createdAt: "desc",
      },
    });

    return res.status(200).json({ data: resumes });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// ### 이력서 상세 조회 API
// - 이력서 ID, 이력서 제목, 자기소개, 작성자명, 이력서 상태, 작성 날짜 조회하기 (단건)
//     - 작성자명을 표시하기 위해서는 상품 테이블과 사용자 테이블의 JOIN이 필요합니다.
router.get("/resumes/:resumeId", async (req, res, next) => {
  try {
    const { resumeId } = req.params;

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

    if (!resume) {
      return res.status(404).json({ message: "이력서 조회에 실패하였습니다." });
    }

    return res.status(201).json({ data: resume });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// ### 이력서 생성 API **(✅ 인증 필요 - middleware 활용)**
// - API 호출 시 이력서 제목, 자기소개 데이터를 전달 받습니다.
router.post("/resumes", authMiddleware, async (req, res, next) => {
  try {
    const { title, introduction } = req.body;
    const { userId, name } = req.user;

    const resume = await prisma.resume.create({
      data: {
        userId: +userId,
        title,
        name: name,
        introduction,
      },
    });

    return res.status(201).json({ data: resume });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// ### 이력서 수정 API **(✅ 인증 필요 - middleware 활용)**
// - 이력서 제목, 자기소개, 이력서 상태 데이터로 넘겨 이력서 수정을 요청합니다.
// - 수정할 이력서 정보는 본인이 작성한 이력서에 대해서만 수정되어야 합니다.
// - 선택한 이력서가 존재하지 않을 경우, `이력서 조회에 실패하였습니다.` 메시지를 반환합니다.
router.patch("/resumes/:resumeId", authMiddleware, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { grade, userId } = req.user;
    const updatedData = req.body;

    const resume = await prisma.resume.findFirst({
      where: { resumeId: +resumeId },
    });

    if (!resume) {
      return res.status(404).json({ message: "이력서 조회에 실패하였습니다." });
    }

    if (grade === 'user' && userId !== resume.userId) {
      return res.status(401).json({ message: "이력서 수정 권한이 없습니다." });
    }

    await prisma.resume.update({
      data: {
        ...updatedData,
      },
      where: {
        resumeId: +resumeId,
      },
    });

    return res.status(200).json({ message: "이력서 수정에 성공하였습니다." });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

// ### 이력서 삭제 API **(✅ 인증 필요 - middleware 활용)**
// - 이력서 ID를 데이터로 넘겨 이력서를 삭제 요청합니다.
// - 본인이 생성한 이력서 데이터만 삭제되어야 합니다.
// - 선택한 이력서가 존재하지 않을 경우, `이력서 조회에 실패하였습니다.` 메시지를 반환합니다.
router.delete("/resumes/:resumeId", authMiddleware, async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    const { userId } = req.user;

    const resume = await prisma.resume.findFirst({
      where: { resumeId: +resumeId },
    });

    if (!resume) {
      return res.status(404).json({ message: "이력서 조회에 실패하였습니다." });
    }

    if (userId !== resume.userId) {
      return res.status(401).json({ message: "이력서 삭제 권한이 없습니다." });
    }

    const del = await prisma.resume.delete({
      where: { resumeId: +resumeId },
    });

    return res.status(200).json({ message: "이력서가 삭제되었습니다." });
  } catch (error) {
    return res.status(500).json({ message: "예기치 못한 에러가 발생하였습니다." });
  }
});

export default router;
