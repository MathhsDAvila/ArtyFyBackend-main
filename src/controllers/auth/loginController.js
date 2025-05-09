import { userValidator, getByEmail } from "../../models/userModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default async function loginController(req, res, next) {
    try {
        // 1. Recebe dados do corpo da requisição
        const user = req.body
        
        // 2. Validação parcial (apenas email e senha são obrigatórios para login)
        const { success, error, data } = userValidator(user, { 
            id: true, 
            name: true, 
            cpf: true,
            dataNascimento: true,
            telefone: true,
            endereco: true
        })

        // 3. Se validação falhar
        if (!success) {
            return res.status(400).json({
                message: "Erro ao validar os dados do login!",
                errors: error.flatten().fieldErrors
            })
        }

        // 4. Busca usuário no banco pelo email
        const result = await getByEmail(data.email)

        // 5. Se usuário não existir
        if (!result) {
            return res.status(400).json({
                message: "Credenciais inválidas!",
                errors: {
                    email: ["Email não cadastrado"]
                }
            })
        }

        // 6. Verifica se a senha está correta
        const passIsValid = bcrypt.compareSync(data.pass, result.pass)
        
        // 7. Se senha inválida
        if (!passIsValid) {
            return res.status(400).json({
                message: "Credenciais inválidas!",
                errors: {
                    pass: ["Senha incorreta"]
                }
            })
        }

        // 8. Prepara payload do token (sem dados sensíveis)
        const payload = {
            id: result.id,
            email: result.email
        }

        // 9. Gera tokens
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' })
        
        // 10. Configura cookie com refreshToken
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            sameSite: 'None', 
            secure: true, 
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 dias
        })

        // 11. Retorna resposta de sucesso
        return res.status(200).json({
            message: "Login realizado com sucesso!",
            accessToken: accessToken,
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                cpf: result.cpf,
                dataNascimento: result.dataNascimento,
                telefone: result.telefone,
                endereco: result.endereco
            }
        })

    } catch(error) {
        next(error)
    }
}