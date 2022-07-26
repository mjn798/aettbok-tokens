// configure environment variables

require('dotenv/config')

// manage imports and configure application

const port    = process.env.SERVER_PORT || 4000
const express = require('express')
const app     = express()

// Firebase configuration

const firebase       = require('firebase/app')
const firebaseAuth   = require('firebase/auth')
const firebaseConfig = { apiKey: process.env.FIREBASE_API_KEY, authDomain: process.env.FIREBASE_AUTH_DOMAIN, projectId: process.env.FIREBASE_PROJECT_ID, appId: process.env.FIREBASE_APP_ID }

firebase.initializeApp(firebaseConfig)

// configure express app

app.disable('x-powered-by')
app.use(express.json())

// CORS middleware

function addCors(_req, res, next) {

    res.header("Access-Control-Allow-Origin", process.env.CORS_ALLOW_ORIGIN)
    res.header("Access-Control-Allow-Methods", "POST")
    res.header("Access-Control-Allow-Headers", "Accept-Encoding, Accept, Content-Type")

    return next()

}

// requests

app.options('/', addCors, (_req, res) => res.status(200).send())

app.post('/', addCors, (req, res) => {

    /*
        200 (OK)                    = success, return token
        400 (Bad Request)           = missing username / password
        401 (Unauthorized)          = wrong username / password
    */

    // Authentication

    const { username, password } = req.body

    if (!(username && password)) { return res.status(400).send() }

    firebaseAuth.signInWithEmailAndPassword(firebaseAuth.getAuth(), username, password)
    .then(result => {
        console.debug(username, 200)
        return res.status(200).send(result.user.stsTokenManager)
    })
    .catch(error => {
        console.error(username, 401, error.code)
        return res.status(401).send()
    })

})

// start server and listen to incoming requests

app.listen(port, () => console.info(`Token Server running on port ${port}`))