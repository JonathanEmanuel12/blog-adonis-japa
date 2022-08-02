import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'

test.group('Auth tests', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })


  test('criar usuario', async ({ client }) => {
    const response = await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tad'
    })

    response.assertStatus(201)
    response.assertBodyContains({
      token: {},
      user: {
        name: 'Tadeu',
        email: 'tadeu@gmail.com',
        nick: 'Tad'
      }
    })
  })

  test('criar usuario com senha menor que 4 caracteres', async ({ client }) => {
    const response = await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '123',
      nick: 'Tad'
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{
        rule: 'minLength',
        field: 'password',
        message: 'Password is very short'
      }]
    })
  })

  test('criar usuario sem os dados obrigatórios', async ({ client }) => {
    const response = await client.post('/auth/signup').form({})

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: "required",
          field: "name",
          message: "The name is required to create a new account"
        },
        {
          rule: "required",
          field: "email",
          message: "The email is required to create a new account"
        },
        {
          rule: "required",
          field: "password",
          message: "The password is required to create a new account"
        },
        {
          rule: "required",
          field: "nick",
          message: "The nick is required to create a new account"
        }
      ]
    })
  })

  test('criar usuario com email repetido', async ({ client }) => {
    await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tad'
    })

    const response = await client.post('/auth/signup').form({
      name: 'Tadeus',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tads'
    })

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{
        rule: 'unique',
        field: 'email',
        message: 'Username not available'
      }]
    })
  })

  test('logar usuario login e senha corretos', async ({ client }) => {
    await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tad'
    })

    const response = await client.post('/auth/signin').form({
      email: 'tadeu@gmail.com',
      password: '12345678',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      token: {},
      user: {
        name: 'Tadeu',
        email: 'tadeu@gmail.com',
        nick: 'Tad'
      }
    })
  })

  test('logar usuario com email incorreto', async ({ client }) => {
    await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tad'
    })

    const response = await client.post('/auth/signin').form({
      email: 'joao@gmail.com',
      password: '12345678',
    })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('logar usuario com senha incorreta', async ({ client }) => {
    await client.post('/auth/signup').form({
      name: 'Tadeu',
      email: 'tadeu@gmail.com',
      password: '12345678',
      nick: 'Tad'
    })

    const response = await client.post('/auth/signin').form({
      email: 'tadeu@gmail.com',
      password: '12348888',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      errors: [{
        message: 'E_INVALID_AUTH_PASSWORD: Password mis-match',
      }]
    })
  })
  test('listar usuarios', async ({ client }) => {

    const response = await client.get('/user')

    console.log(response.body())
    response.assertStatus(200)
    // response.assertBodyContains()
  })
})
