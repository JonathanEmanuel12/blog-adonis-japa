import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { faker } from '@faker-js/faker';

interface UserTest {
  name: string,
  email: string,
  password?: string,
  nick: string
}

test.group('User tests', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  function generateUser(): UserTest {
    return {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      nick: faker.lorem.word()
    }
  }

  test('show usuario existente', async ({ client }) => {
    const user = generateUser()
    const createdUser = await client.post('/auth/signup').form(user)
    const id = createdUser.body().user.id
    const response = await client.get('/user/' + id)

    delete user.password

    response.assertStatus(200)
    response.assertBodyContains({ user: { ...user } })
  })
  
  test('show usuario inexistente', async ({ client }) => {
    const response = await client.get('/user/999')

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'E_ROW_NOT_FOUND: Row not found'
    })
  })

  test('alterar usuario existente', async ({ client }) => {
    const originalUser = generateUser()
    const partialUser = {
      name: faker.name.firstName(),
      nick: faker.lorem.word()
    }

    const createResponse = await client.post('/auth/signup').form(originalUser)
    const id = createResponse.body().user.id
    const bearerToken: string = createResponse.body().token.token

    const response = await client.put('/user/' + id).form(partialUser)
    .bearerToken(bearerToken)

    response.assertStatus(200)
    response.assertBodyContains({ user: { ...partialUser } })
  })

  test('usuário alterar outro usuário', async ({ client }) => {
    const partialUser = {
      name: faker.name.firstName(),
      nick: faker.lorem.word()
    }

    const createResponse1 = await client.post('/auth/signup').form(generateUser())
    const createResponse2 = await client.post('/auth/signup').form(generateUser())

    const id = createResponse1.body().user.id
    const bearerToken: string = createResponse2.body().token.token

    const response = await client.put('/user/' + id).form(partialUser)
    .bearerToken(bearerToken)

    response.assertStatus(403)
    response.assertBodyContains({ message: 'Alteração não permitida' })
  })

  test('delete usuario existente', async ({ client }) => {
    const user = generateUser()
    const createResponse = await client.post('/auth/signup').form(user)
    const id = createResponse.body().user.id
    const bearerToken: string = createResponse.body().token.token

    const response = await client.delete('/user/' + id).bearerToken(bearerToken) 

    response.assertStatus(204)
    response.assertBodyContains({})
  })

  test('usuário deletar outro usuário', async ({ client }) => {
    const partialUser = {
      name: faker.name.firstName(),
      nick: faker.lorem.word()
    }

    const createResponse1 = await client.post('/auth/signup').form(generateUser())
    const createResponse2 = await client.post('/auth/signup').form(generateUser())

    const id = createResponse1.body().user.id
    const bearerToken: string = createResponse2.body().token.token

    const response = await client.delete('/user/' + id).form(partialUser)
    .bearerToken(bearerToken)

    response.assertStatus(403)
    response.assertBodyContains({ message: 'Alteração não permitida' })
  })

  // Não consegui descobrir porque o listar usuários pega os usuários criados nos outros testes
  // e o listar usuários 2 não aparece. Deixei os console.log() neles
  test('listar usuarios', async ({ client }) => {
    const numberOfUser = 2
    const users: UserTest[] = []

    for (let i = 0; i < numberOfUser; i++) {
      users.push(generateUser())
      await client.post('/auth/signup').form(users[i])
      delete users[i].password
    }

    const response = await client.get('/user')

    console.log(response.body())
    response.assertStatus(200)
    response.assertBodyContains(users)
  })

  test('listar usuarios 2', async ({ client }) => {

    const response = await client.get('/user')

    console.log(response.body())
    response.assertStatus(200)
  })

  // test('criar usuario sem os dados obrigatórios', async ({ client }) => {
  //   const response = await client.post('/auth/signup').form({})

  //   response.assertStatus(422)
  //   response.assertBodyContains({
  //     errors: [
  //       {
  //         rule: "required",
  //         field: "name",
  //         message: "The name is required to create a new account"
  //       },
  //       {
  //         rule: "required",
  //         field: "email",
  //         message: "The email is required to create a new account"
  //       },
  //       {
  //         rule: "required",
  //         field: "password",
  //         message: "The password is required to create a new account"
  //       },
  //       {
  //         rule: "required",
  //         field: "nick",
  //         message: "The nick is required to create a new account"
  //       }
  //     ]
  //   })
  // })

  // test('criar usuario com email repetido', async ({ client }) => {
  //   await client.post('/auth/signup').form({
  //     name: 'Tadeu',
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //     nick: 'Tad'
  //   })

  //   const response = await client.post('/auth/signup').form({
  //     name: 'Tadeus',
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //     nick: 'Tads'
  //   })

  //   response.assertStatus(422)
  //   response.assertBodyContains({
  //     errors: [{
  //       rule: 'unique',
  //       field: 'email',
  //       message: 'Username not available'
  //     }]
  //   })
  // })

  // test('logar usuario login e senha corretos', async ({ client }) => {
  //   await client.post('/auth/signup').form({
  //     name: 'Tadeu',
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //     nick: 'Tad'
  //   })

  //   const response = await client.post('/auth/signin').form({
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //   })

  //   response.assertStatus(200)
  //   response.assertBodyContains({
  //     token: {},
  //     user: {
  //       name: 'Tadeu',
  //       email: 'tadeu@gmail.com',
  //       nick: 'Tad'
  //     }
  //   })
  // })

  // test('logar usuario com email incorreto', async ({ client }) => {
  //   await client.post('/auth/signup').form({
  //     name: 'Tadeu',
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //     nick: 'Tad'
  //   })

  //   const response = await client.post('/auth/signin').form({
  //     email: 'joao@gmail.com',
  //     password: '12345678',
  //   })

  //   console.log(response.body())

  //   response.assertStatus(404)
  //   response.assertBodyContains({
  //     message: 'E_ROW_NOT_FOUND: Row not found',
  //   })
  // })

  // test('logar usuario com senha incorreta', async ({ client }) => {
  //   await client.post('/auth/signup').form({
  //     name: 'Tadeu',
  //     email: 'tadeu@gmail.com',
  //     password: '12345678',
  //     nick: 'Tad'
  //   })

  //   const response = await client.post('/auth/signin').form({
  //     email: 'tadeu@gmail.com',
  //     password: '12348888',
  //   })

  //   console.log(response.body())

  //   response.assertStatus(400)
  //   response.assertBodyContains({
  //     errors: [{
  //       message: 'E_INVALID_AUTH_PASSWORD: Password mis-match',
  //     }]
  //   })
  // })
})
