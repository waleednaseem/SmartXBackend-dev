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


App.get('/admin', ctrl.ADMIN)
App.post('/register', ctrl.Register)
App.post('/login', ctrl.Login)
App.post('/profile', ctrl.makeProfile)
// App.get('/userDetail',ctrl.userDetail)
App.post('/refferals',ctrl.refferals)

App.post('/upgrade',ctrl.placementInvest)

App.post('/levels',ctrl.levelFromTable)

App.post('/ShowReffTrend',ctrl.ShowReff)
App.get('/trenduser/:userId',ctrl.getUserByTrend)


//payments

App.get('/wallet',ctrl.wallets)
// App.post('/upgrade',ctrl.Placements)

//payments end 

// small api for find pakages and transaction 
App.get('/finduserdetail', ctrl.FIndUserDetail)
App.get('/finduserpakage', ctrl.FindUserPakage)

//decode
App.post('/decode', ctrl.decode)
//decode end


App.post('/check', Authentication, (req, res) => {
    res.status(200).send('Api is working properly')
})

App.listen(port, () => {
    console.log(`your are connected with port ${port}`)
})

