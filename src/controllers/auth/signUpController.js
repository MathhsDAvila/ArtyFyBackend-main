import { create, userValidator, getByEmail } from "../../models/userModel.js"
import bcrypt from 'bcrypt'

export default async function signUpController(req, res, next) {
    try {
        // 1. Recebe dados do corpo da requisição
        const user = req.body
        
        // 2. Valida os dados (ignorando id pois é autoincremento)
        const { success, error, data } = userValidator(user, { id: true })
        
        // 3. Se validação falhar, retorna erros
        if (!success) {
            return res.status(400).json({
                message: "Erro ao validar os dados do usuário!",
                errors: error.flatten().fieldErrors
            })
        }

        // 4. Verifica se email já está cadastrado
        const existingUser = await getByEmail(data.email)
        if (existingUser) {
            return res.status(400).json({
                message: "Erro ao criar usuário!",
                errors: {
                    email: ["Email já cadastrado!"]
                }
            })
        }

        // 5. Criptografa senha antes de salvar
        data.pass = bcrypt.hashSync(data.pass, 10)
        
        // 6. Tenta criar usuário no banco
        const result = await create(data)
        
        // 7. Se criação falhar
        if (!result) {
            return res.status(500).json({
                message: "Erro ao criar usuário!"
            })
        }
        
        // 8. Retorna sucesso (201 Created)
        return res.status(201).json({
            message: "Usuário criado com sucesso!",
            user: result
        })
        
    } catch (error) {
        // 9. Trata erros específicos do Prisma
        if (error?.code === "P2002") {
            const field = error.meta?.target?.includes('email') ? 'email' : 
                         error.meta?.target?.includes('cpf') ? 'cpf' : 'campo';
            
            return res.status(400).json({
                message: "Erro ao criar usuário!",
                errors: {
                    [field]: [`${field} já cadastrado!`]
                }
            })
        }
        
        // 10. Outros erros são passados adiante
        next(error)
    }
}