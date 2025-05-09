import { PrismaClient } from '@prisma/client'
import { z } from 'zod'


const prisma = new PrismaClient()

const userSchema = z.object({
    id: z.number({
        invalid_type_error: "O id deve ser um valor numérico.",
        required_error: "O id é obrigatório."
    }),
    name: z.string({
        invalid_type_error: "O nome deve ser uma string.",
        required_error: "O nome é obrigatório."
    })
    .min(3, {message: "O nome deve ter no mínimo 3 caracteres."})
    .max(255, {message: "O nome deve ter no máximo 255 caracteres."}),
    email: z.string({
        invalid_type_error: "O email deve ser uma string.",
        required_error: "O email é obrigatório."
    })
    .email({message: "Email inválido."}),
    pass: z.string({
        invalid_type_error: "A senha deve ser uma string.",
        required_error: "A senha é obrigatória."
    })
    .min(6, {message: "A senha deve ter no mínimo 6 caracteres."})
    .max(15, {message: "A senha deve ter no máximo 15 caracteres."}),
    cpf: z.string({
        invalid_type_error: "O CPF deve ser uma string.",
        required_error: "O CPF é obrigatório."
    })
    .length(11, {message: "O CPF deve ter 11 dígitos."}),
    dataNascimento: z.string({
        invalid_type_error: "A data de nascimento deve ser uma string.",
        required_error: "A data de nascimento é obrigatória."
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {message: "Formato de data inválido. Use AAAA-MM-DD."}),
    telefone: z.string({
        invalid_type_error: "O telefone deve ser uma string.",
        required_error: "O telefone é obrigatório."
    })
    .min(10, {message: "O telefone deve ter no mínimo 10 dígitos."})
    .max(15, {message: "O telefone deve ter no máximo 15 dígitos."}),
    endereco: z.string({
        invalid_type_error: "O endereço deve ser uma string.",
        required_error: "O endereço é obrigatório."
    })
    .max(500, {message: "O endereço deve ter no máximo 500 caracteres."})
})

export const userValidator = (user, partial = null) => {
    if (partial) {
        return userSchema.partial(partial).safeParse(user)
    } 
    return userSchema.safeParse(user)
}

export async function create(user){
    const result = await prisma.user.create({
        data: user,
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            dataNascimento: true,
            telefone: true,
            endereco: true
        }
    })
    return result
}

export async function list(){
    const result = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            dataNascimento: true,
            telefone: true,
            endereco: true
        }
    })
    return result
}

export async function getById(id){
    const result = await prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            dataNascimento: true,
            telefone: true,
            endereco: true
        }
    })
    return result
}

export async function getByEmail(email){
    const result = await prisma.user.findUnique({
        where: {
            email
        }
    })
    return result
}

export async function remove(id){
    const result = await prisma.user.delete({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })
    return result
}

export async function update(id, user){
    const result = await prisma.user.update({
        where: {
            id: id
        },
        data: user,
        select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            dataNascimento: true,
            telefone: true,
            endereco: true
        }
    })
    return result
}

export async function updateName(id, name){
    const result = await prisma.user.update({
        where: {
            id: id
        },
        data: {
            name: name
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })
    return result
}