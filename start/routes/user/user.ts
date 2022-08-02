import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.resource('/user', 'UsersController')
})
    .namespace('App/Controllers/Http/User')
