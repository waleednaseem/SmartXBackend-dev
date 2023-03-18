const express = require('express')

const App = express()
const port = 8080
const cors = require('cors')
const bodyparser = require('body-parser')
const ctrl = require('./Server/Controller/Authenticaion')
const Authentication = require('./Server/Middleware/Authentication')


App.use(cors({
    origin: '*'
}))

App.use(bodyparser.urlencoded({ extended: false }))

// parse application/json
App.use(bodyparser.json())


App.post('/signup', ctrl.makeUser)
App.post('/login', ctrl.Login)
App.post('/userDetail',ctrl.userDetail)
App.post('/refferals',ctrl.refferals)

App.post('/placement',ctrl.placementInvest)

App.post('/levels',ctrl.levelFromTable)

App.post('/ShowReffTrend',ctrl.ShowReff)
App.get('/trenduser/:userId',ctrl.getUserByTrend)


//payments

App.post('/wallet',ctrl.wallets)
App.post('/upgrade',ctrl.UserUpgrade)

//payments end 

// small api for find pakages and transaction 
App.get('/find', ctrl.FIndUser)
App.post('/finduserpakage', ctrl.FindUserPakage)
// App.post('/finduserpakage', ctrl.findTransac)
// small api for find pakages and transaction finish 

//decode
App.post('/decode', ctrl.decode)
//decode end


App.post('/check', Authentication, (req, res) => {
    res.status(200).send('Api is working properly')
})

App.listen(port, () => {
    console.log(`your are connected with port ${port}`)
})

