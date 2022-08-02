import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'

export default class PostsController {
    public async index({ params, response }: HttpContextContract) {
        try {
            const { title = '' } = params
            const posts = await Post.query()
            .whereILike('title', `%${title}%`)

            return response.ok(posts)
        } catch (error) {
            console.log(error)
            return response.internalServerError(error.message)
        }
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        try {
            const post = await Post.findOrFail(id)

            return response.ok({ post })
        } catch (error) {
            console.log(error)
            return response.internalServerError(error.message)
        }
    }

    public async update({ params, request, auth, response }: HttpContextContract) {
        const { id } = params
        const loggedUser = await auth.authenticate()
        try {
            const {title, comment} = await request.body()
            const post = await Post.findOrFail(id)

            if(post.userId !== loggedUser.id) {
                return response.forbidden({ message: 'Alteração não permitida' })
            }

            post.merge({title, comment})
            await post.save()

            return response.ok({ post })
        } catch (error) {
            console.log(error)
            return response.internalServerError(error.message)  
        }
    }

    public async destroy({ params, auth, response }: HttpContextContract) {
        const { id } = params
        const loggedUser = await auth.authenticate()
        try {
            const post = await Post.findOrFail(id)
            if(post.userId !== loggedUser.id) {
                return response.forbidden('Alteração não permitida')
            }
            
            await post.delete()
            return response.noContent()
        } catch (error) {
            console.log(error)
            return response.internalServerError(error.message)
        }
    }
}
