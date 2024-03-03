import { UsersService } from "../service/users.service.js";

export class UsersController {

    usersService = new UsersService();

    //회원가입 API
    signUp = async (req, res, next) => {
        try {
            const { email, password, password2, name } = req.body;

            if (!email) {
                return res.status(400).json({ message: "이메일은 필수값입니다." });
            }

            if (!password) {
                return res.status(400).json({ message: "비밀번호는 필수값입니다." });
            }

            if (!password2) {
                return res.status(400).json({ message: "비밀번호 확인은 필수값입니다." });
            }

            if (password !== password2) {
                return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
            }

            if (password.length < 6) {
                return res.status(406).json({ message: "비밀번호는 6자 이상입니다." });
            }

            if (!name) {
                return res.status(400).json({ message: "이름은 필수값입니다." });
            }

            const user = await this.usersService.signUp(email, password, name);

            return res.status(201).json({ message: "회원가입이 완료되었습니다." });
        } catch (err) {
            return res.status(err.code).json(err);
        }
    };

    //로그인 API
    signIn = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email) {
                return res.status(400).json({ message: "이메일은 필수값입니다." });
            }

            if (!password) {
                return res.status(400).json({ message: "비밀번호는 필수값입니다." });
            }

            const token = await this.usersService.signIn(email, password);

            res.cookie("authorization", `Bearer ${token}`);

            return res.status(200).json({ message: "로그인에 성공하였습니다." });
        } catch (err) {
            return res.status(err.code).json(err);
        }
    };

    //사용자 정보 조회 API
    getUsers = async (req, res, next) => {
        try {
            const { userId } = req.user;

            const user = await this.usersService.getUsers(userId);

            return res.status(201).json({ data: user });
        } catch (err) {
            return res.status(err.code).json(err);
        }
    }
}