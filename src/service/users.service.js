import { UsersRepository } from "../repository/users.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

export class UsersService {
    usersRepository = new UsersRepository();

    //회원가입 API
    signUp = async (email, password, name) => {

        //이메일로 사용자 찾아서 가져오기
        const isExistUser = await this.usersRepository.findUserByEmail(email);

        //이메일 중복되는지 확인
        if (isExistUser) {
            throw {
                code: 409,
                message: "이미 존재하는 이메일입니다."
            };
        }

        //비밀번호 hash 처리하여 데이터베이스 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        //사용자 테이블 생성
        const user = await this.usersRepository.createUser(email, hashedPassword, name);

        return user;
    }

    //로그인 API
    signIn = async (email, password) => {

        const user = await this.usersRepository.findUserByEmail(email);

        //로그인한 이메일이 Users 테이블에 없는 경우
        if (!user) {
            throw {
                code: 401,
                message: "존재하지 않는 이메일입니다."
            };
        }

        //비밀번호가 일치하지 않는 경우
        if (!(await bcrypt.compare(password, user.password))) {
            throw {
                code: 401,
                message: "비밀번호가 일치하지 않습니다."
            };
        }

        //userId를 할당한 jwt를 'custom-secret-key'라는 비밀 키와 함께 생성, 유효기한 12시간
        const Token = jwt.sign(
            { userId: user.userId },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: "12h" },
        );
        //const refreshToken = jwt.sign({userId : user.userId}, env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: "7d"});

        // tokenStorages[refreshToken] = {
        //   userId : user.userId,
        //   ip : req.ip,
        //   userAgent : req.headers['user-agent'],
        // }

        //쿠키에 해당하는 토큰 값 전달
        return Token;
        //res.cookie('refreshToken', refreshToken);
    }

    getUsers = async (userId) => {
        //인증에 성공하고, 비밀번호를 제외한 정보 반환
        const user = await this.usersRepository.findUserById(userId);

        return user;
    }
}