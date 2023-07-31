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


// Function to send verification email



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


//mailer
// Endpoint for email verification
App.post('/verify-email', ctrl.verifyEmail);
App.get('/get_user_profile', ctrl.Get_userProfile);

// Endpoint for verifying the code
App.post('/verify-code', ctrl.verifyCode);
App.get('/activate', ctrl.isActivate);
// App.post('/mob_verify', ctrl.mob_verify);
//mailer

//payments

App.get('/wallet', ctrl.wallets)
App.post('/withdraw', ctrl.Withdraw)
// App.post('/upgrad',ctrl.Placements)

//payments end 

// small api for find pakages and transaction 
App.get('/finduserdetail', ctrl.FIndUserDetail)

App.get('/findTransac', ctrl.findTransac)
App.get('/findrefferal', ctrl.FindRefferal)
App.post('/resetpassword', ctrl.ResetPassword)
App.get('/profile_info', ctrl.profileInfo)
App.post('/update_profile', ctrl.update_profile)
App.get('/find_Direct_Reff_Transactions', ctrl.find_Direct_Reff_Transactions)

//decode
App.post('/decode', ctrl.decode)
App.get('/snippet', ctrl.Upgrade_Snippet)
//decode end


App.post('/check', (req, res) => {
    res.status(200).send('Api is working properly')
})

App.listen(port, () => {
    console.log(`your are connected with port ${port}`)
})

