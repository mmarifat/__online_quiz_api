<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Online Quiz-API - backend starter package

TECHHACKCANADA - Backend Developer Challenge - July 25, 2021

## Used Tech's

- Nest JS
- MongoDb
- JWT
- Bcrypt
- Class Validators
- Swagger Api Docs
- Faker
- EsLint
- Prettier etc

## Installation

```bash
Linux:
$ sudo apt install redis-server

Windows:
$ https://github.com/microsoftarchive/redis/releases

Package:
$ yarn install
or
$ npm i
```

## Before Running the app #1

```bash
# run seeder
$ yarn seeder:dev
or
$ npm run seeder:dev

# production mode
$ yarn seeder:prod
or
$ npm run seeder:prod
```

## Before Running the app #2 (To Generate Fake Data)

```bash
# run faker
$ yarn faker:dev
or
$ npm run faker:dev

# production mode
$ yarn faker:prod
or
$ npm run faker:prod
```

## Running the app

```bash

# development mode
$ yarn start:dev
or
$ npm run start:dev

# production mode
$ yarn start:prod
or
$ npm run start:prod
```

## Users

```bash
# test setter
user: mma.rifat66@gmail.com
password: 123456
isRemembered: 1 or 0

# test taker
user: alamin@gmail.com
password: 123456
isRemembered: 1 or 0
```

## API Features

=> Auth

- Authentication using JWT
- Registration of for only test takers

=> User Module (Test Setter Guard)

- Paginated User List
- New User Create (Both setter and taker)
- User Update
- User Delete (soft)
- Get User By ID

=> Role Module

- Get All Roles
- Get Role By ID

=> Category Module (Test Setter Guard)

- Get All Catgories
- New Category Create
- Update Category
- Delete Category (soft)
- Get Category By ID

=> Question Module (Test Setter Guard)

- Get Random Question By Limit
- Get Random Question By Limit By Category ID
- New Question Create
- Update Question
- Delete Question (soft)
- Get Question By ID

=> Quiz Test Module (Test Setter Guard)

- Get Paginated Tests List
- New Quiz-Test Create
- Update Quiz-Test
- Delete Quiz-Test (soft)
- Get Quiz-Test By ID

=> User Quiz Test Module (Both Test Taker and Setter Guard)

- Attend Quiz-Test one time for each test by user ID
- Get Test Result by Test ID and User ID

## API Documentations

Please Refer to the any of the following url after running the app using previous instruction.

- [Docs](http://localhost:9199/quiz-api) in localhost <br> or
- [Docs](http://127.0.0.1:9199/quiz-api) in 127.0.0.1

## Test (Not Implemented)

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them,
please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
