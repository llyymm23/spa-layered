import jwt from "jsonwebtoken";
import { prisma } from "../models/index.js";
import env from "dotenv";

env.config();

// ### 인증 Middleware
// 1. Request Header의 Authorization 정보에서 JWT를 가져와서, 인증 된 사용자인지 확인하는 Middleware를 구현합니다.
// 2. 인증에 실패하는 경우에는 알맞은 Http Status Code와 에러 메세지를 반환 해야 합니다.
//     - Authorization에 담겨 있는 값의 형태가 표준(Authorization: Bearer <JWT Value>)과 일치하지 않는 경우
//     - JWT의 유효기한이 지난 경우
//     - JWT 검증(JWT Secret 불일치, 데이터 조작으로 인한 Signature 불일치 등)에 실패한 경우
// 3. 인증에 성공하는 경우에는 req.locals.user에 인증 된 사용자 정보를 담고, 다음 동작을 진행합니다.

export default async function (req, res, next) {
  try {
    //users.router.js에서 로그인할 때 쿠키에 'authorization'이라는 키로 저장한 값 가져옴
    const { authorization } = req.cookies;

    //'authorization'의 값이 존재하지 않는 경우
    if (!authorization) throw new Error("로그인이 필요합니다.");

    //공백을 기준으로 왼쪽 부분인 Bearer는 tokenType에, 저장된 jwt 값은 token에 저장
    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 Bearer 형식이 아닙니다.");

    if (!token) throw new Error("인증 정보가 올바르지 않습니다.");

    //jwt를 sign할 때 만들었던 비밀키와 비교하여 해당 서버에서 발급한 jwt가 맞는지 확인
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const userId = decodedToken.userId;

    if (!userId) throw new Error("인증 정보가 올바르지 않습니다.");

    //userId로 해당하는 값 조회
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user) throw new Error("토큰 사용자가 존재하지 않습니다.");

    //인증에 성공하여 인증된 사용자 정보를 담고, 다음 동작을 진행
    req.user = user;
    next();
  } catch (error) {
    //JWT의 유효기한이 지난 경우
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "토큰이 만료되었습니다." });
    }
    //JWT의 검증에 실패한 경우
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "토큰이 조작되었습니다." });
    }
    return res.status(400).json({ message: error.message });
  }
}
