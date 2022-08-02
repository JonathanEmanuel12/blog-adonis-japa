import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

import CreateUser from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public async signup({ request, auth, response }: HttpContextContract) {
    const payloadUser = await request.validate(CreateUser)
    const user = await User.create(payloadUser)
    const { email, password } = payloadUser
    const token = await auth.attempt(email, password)

    return response.created({ user, token })
  }

  public async signin({ request, auth, response }: HttpContextContract) {
    const { email, password } = request.body()
    console.log(email)
    const user = await User.findByOrFail('email', email)
    const token = await auth.attempt(email, password, {
      expiresIn: '7days'
    })

    return response.ok({ user, token })
  }
}
