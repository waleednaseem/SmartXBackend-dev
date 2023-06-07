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
App.post('/refferals', Authentication, ctrl.refferals)

App.post('/upgrade', Authentication, ctrl.Upgrades)
App.post('/purchase_package', Authentication, ctrl.placementInvest)

App.get('/Pakage_info', Authentication, ctrl.Pakage_info)


App.post('/ShowReffTrend', Authentication, ctrl.ShowReff)
App.get('/trenduser/:userId', Authentication, ctrl.getUserByTrend)


//payments

App.get('/wallet', Authentication, ctrl.wallets)
// App.post('/upgrade',Authentication,ctrl.Placements)

//payments end 

// small api for find pakages and transaction 
App.get('/finduserdetail', Authentication, ctrl.FIndUserDetail)
App.get('/finduserpakage', Authentication, ctrl.FindUserPakage)
App.get('/find_Direct_Reff_Transactions', Authentication, ctrl.find_Direct_Reff_Transactions)

//decode
App.post('/decode', ctrl.decode)
//decode end


App.post('/check', Authentication, (req, res) => {
    res.status(200).send('Api is working properly')
})

App.listen(port, () => {
    console.log(`your are connected with port ${port}`)
})

