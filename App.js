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
App.post('/refferals', ctrl.refferals)

App.post('/upgrade', ctrl.Upgrades)
App.post('/purchase_package', ctrl.placementInvest)

App.post('/Pakage_info', ctrl.Pakage_info)
App.get('/finduserpakage', ctrl.FindUserPakage)

App.post('/ShowReffTrend', ctrl.ShowReff)
App.post('/trenduser', ctrl.getUserByTrend)
App.post('/testTrend', ctrl.testTrend)


//payments

App.get('/wallet', ctrl.wallets)
// App.post('/upgrad',ctrl.Placements)

//payments end 

// small api for find pakages and transaction 
App.get('/finduserdetail', ctrl.FIndUserDetail)

App.get('/findTransac', ctrl.findTransac)
App.get('/find_Direct_Reff_Transactions', ctrl.find_Direct_Reff_Transactions)

//decode
App.post('/decode', ctrl.decode)
//decode end


App.post('/check', (req, res) => {
    res.status(200).send('Api is working properly')
})

App.listen(port, () => {
    console.log(`your are connected with port ${port}`)
})

