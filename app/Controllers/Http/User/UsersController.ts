import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
    public async index({ params, response }: HttpContextContract) {
        const { name = '' } = params
        const users = await User.query()
            .whereILike('name', `%${name}%`)

        return response.internalServerError(users)
        return response.ok(users)
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params

        if (Number.isNaN(Number(id))) {
            return response.badRequest('O id deve ser numérico')
        }
        const user = await User.findOrFail(id)

        return response.ok({ user })
    }

    public async update({ params, request, auth, response }: HttpContextContract) {
        const { id } = params
        const loggedUser = await auth.authenticate()
        const payloadUser = await request.validate(UpdateUser)

        if (Number.parseInt(id) !== loggedUser.id) {
            return response.forbidden({ message: 'Alteração não permitida' })
        }
        const user = await User.findOrFail(id)
        user.merge(payloadUser)
        await user.save()

        console.log(payloadUser)

        return response.ok({ user })
    }

    public async destroy({ params, auth, response }: HttpContextContract) {
        const { id } = params
        const loggedUser = await auth.authenticate()
        if (Number.parseInt(id) !== loggedUser.id) {
            return response.forbidden({ message: 'Alteração não permitida' })
        }

        const user = await User.findOrFail(id)
        await user.delete()

        return response.noContent()
    }
}