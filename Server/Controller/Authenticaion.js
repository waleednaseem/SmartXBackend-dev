const db = require("../models");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { Sequelize } = require("sequelize");
const { sequelize } = require("../models");
const nodemailer = require('nodemailer');
const client = require('twilio')('AC4148bda9be96f980d55d67df8c2f2853', '719e1a252dc5fd233f5658e86629eecd')

//finding user
// const user=req.headers.authorization.split(' ')[1]
// const user_info= jwt_decode(user)

const User = db.User;
const Profile = db.Profile;
const Refferal = db.Refferal;
const Pakage = db.Pakage;
const wallet = db.wallet;
const Transaction = db.Transaction;
const Upgrade = db.Upgrade;
const TotalIncome = db.total_income;
const TotalWithdraw = db.total_withdraw;
const User_Profile = db.User_profile

const pakage_prices1 = 10;
const pakage_prices2 = 20;
const pakage_prices3 = 50;
const pakage_prices4 = 100;
const pakage_prices5 = 200;
const pakage_prices6 = 350;

const level_1 = 100;
const level_2 = 200;
const level_3 = 300;
const level_4 = 400;
const level_5 = 500;
const level_6 = 600;
const level_7 = 700;
const level_8 = 800;

// const user = req.headers.authorization.split(' ')[1]
//   const user_info = jwt_decode(user)

const ADMIN = async (req, res) => {
  const admin = await Profile.findOne({ where: { id: 1 } });

  if (!admin) {
    // Create the admin user if it doesn't exist
    await User.create({
      username: "admin",
      password:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6ImFkbWluIiwiaWF0IjoxNjgwMTYyNzMzfQ.yOul8XoSF7ygQZagbpyVMNnwjNkMkRcsM-4PcTsXf-w",
      refferal: 0,
      user_id: 1,
    });
    await Profile.create({
      refferal: 0,
      user_id: 1,
    });

    // Create a wallet for the admin user
    await wallet.create({
      payment: 0,
      user_id: 1,
    });
    res.json({ msg: "admin created" });
  } else {
    res.json({ msg: "admin found" });
  }
};

const FIndUserDetail = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  const users = await User.findOne({ where: { id: user_info.id } });
  const placement = await Profile.findOne({
    where: {
      [Sequelize.Op.or]: [{ left: user_info.id }, { right: user_info.id }],
    },
  });
  const DirectReff = await Profile.findOne({
    where: { user_id: user_info.id },
    attributes: ['user_id'],
    include: [{
      model: Refferal,
      attributes: ['refferal', 'user_id'],
      include: [{
        model: User,
        as: 'directReffUser'
      }]
    }],
  });
  const YourRefferalDirect = await Refferal.findAll({
    where: { refferal: user_info.id }
  })
  res.json({ users, placement, DirectReff, YourRefferalDirect });
};

const Register = async (req, res) => {
  const { username, password, refferal } = req.body

  const hashedPassword = jwt.sign({ password }, "teriMaaKiChot");
  const USER = await User.findOne({ where: { username: username } });
  const findReff = await User.findOne({ where: { id: refferal } })
  // res.json(findReff.username)
  // return false
  if (username != '' && password != '' && refferal != '') {
    if (findReff) {
      if (!USER) {
        const userInfo = await User.create({
          username: username,
          password: hashedPassword,
        });
        await Refferal.create({
          refferal: refferal,
          user_id: userInfo.id,
        });
        await wallet.create({
          payment: 0,
          user_id: userInfo.id
        })
        await User_Profile.create({
          user_id: userInfo.id
        })
        res.json("User Registered Successfully");
      } else {
        res.json("User Found!");
      }
    } else {
      res.json("Refferal not Found!");
    }
  } else {
    res.json("Please fill all fields!");
  }
};

const Login = async (req, res) => {
  const { username, password } = req.body;


  const user = await User.findOne({
    where: {
      username: username
    },
  });
  const hashPassword = await jwt_decode(user.password);

  if (hashPassword.password == password) {
    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, "teriMaaKiChot");

    if (!token) {
      return res.status(401).send("Invalid password");
    }

    try {
      res.status(200).send({ message: "Logged in successfully", token });
    } catch (err) {
      res.status(500).send({ message: "Error creating token" });
    }
  } else {
    return res.status(200).send("User not found");
  }

};

const userDetail = async (req, res) => {
  const userfind = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userfind);
  const user = await Profile.findOne({ where: { user_id: user_info.id } });
  res.status(200).send(user);
};

const showusers = async (req, res) => {
  const referral = await Refferal.findAll({
    where: { refferal: req.body.refferal },
    include: [
      {
        model: Profile,
        as: "ReffUsers",
      },
    ],
  });
  res.status(200).send(referral);
};

const refferals = async (req, res) => {
  const userfind = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userfind);
  const user = await Profile.findOne({
    where: { user_id: user_info.id },
    attributes: ["id", "phone", "email", "left", "right"],
    include: [
      {
        model: Refferal,
        as: "left_placement",
        attributes: ["user_id", "placement_id"],
        include: [
          {
            model: Profile,
            as: "ReffUsers",
            attributes: ["id", "phone", "email", "left", "right"],
            include: [
              {
                model: Refferal,
                as: "left_placement",
                attributes: ["user_id", "placement_id"],
                include: [
                  {
                    model: Profile,
                    as: "ReffUsers",
                    attributes: ["id", "phone", "email", "left", "right"],
                    include: [
                      {
                        model: Refferal,
                        as: "left_placement",
                        attributes: ["user_id", "placement_id"],
                        include: [
                          {
                            model: Profile,
                            as: "ReffUsers",
                            attributes: [
                              "id",
                              "phone",
                              "email",
                              "left",
                              "right",
                            ],
                            include: [
                              {
                                model: Refferal,
                                as: "left_placement",
                                attributes: ["user_id", "placement_id"],
                                include: [
                                  {
                                    model: Profile,
                                    as: "ReffUsers",
                                    attributes: [
                                      "id",
                                      "phone",
                                      "email",
                                      "left",
                                      "right",
                                    ],
                                    include: [
                                      {
                                        model: Refferal,
                                        as: "left_placement",
                                        attributes: ["user_id", "placement_id"],
                                        include: [
                                          {
                                            model: Profile,
                                            as: "ReffUsers",
                                            attributes: [
                                              "id",
                                              "phone",
                                              "email",
                                              "left",
                                              "right",
                                            ],
                                            include: [
                                              {
                                                model: Refferal,
                                                as: "left_placement",
                                                attributes: [
                                                  "user_id",
                                                  "placement_id",
                                                ],
                                                include: [
                                                  {
                                                    model: Profile,
                                                    as: "ReffUsers",
                                                    attributes: [
                                                      "id",
                                                      "phone",
                                                      "email",
                                                      "left",
                                                      "right",
                                                    ],
                                                    include: [
                                                      {
                                                        model: Refferal,
                                                        as: "left_placement",
                                                        attributes: [
                                                          "user_id",
                                                          "placement_id",
                                                        ],
                                                        include: [
                                                          {
                                                            model: Profile,
                                                            as: "ReffUsers",
                                                            attributes: [
                                                              "id",
                                                              "phone",
                                                              "email",
                                                              "left",
                                                              "right",
                                                            ],
                                                            include: [
                                                              {
                                                                model: Refferal,
                                                                as: "left_placement",
                                                                attributes: [
                                                                  "user_id",
                                                                  "placement_id",
                                                                ],
                                                                include: [
                                                                  {
                                                                    model:
                                                                      Profile,
                                                                    as: "ReffUsers",
                                                                    attributes:
                                                                      [
                                                                        "id",
                                                                        "phone",
                                                                        "email",
                                                                        "left",
                                                                        "right",
                                                                      ],
                                                                  },
                                                                ],
                                                              },
                                                            ],
                                                          },
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  const CountLevel = [];

};

const FindRefferal = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const refferal = await Refferal.findAll({
    where: { refferal: user_info.id },
    attributes: ['refferal', 'user_id'],
    include: { model: User, as: "User", attributes: ['username'] }
  })
  res.json(refferal)
}
const ResetPassword = async (req, res) => {
  const { password, new_password } = req.body
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const findUser = await User.findOne({ where: { id: user_info.id } })
  const decode = jwt_decode(findUser.password)

  if (decode.password == password) {
    const hashedPassword = jwt.sign({ password: new_password }, "teriMaaKiChot")
    User.update({
      password: hashedPassword
    }, {
      where: { id: user_info.id }
    })
    res.json("Password changed!")
  } else {
    res.json('cant change!')
  }
}

const Upgrades = async (req, res) => {
  const { pkg } = req.body
  const Upgrades1 = 10;
  const Upgrades2 = 20;
  const Upgrades3 = 50;
  const Upgrades4 = 100;
  const Upgrades5 = 200;
  const Upgrades6 = 350;

  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);
  const find_income = await TotalIncome.findOne({ where: { user_id: user_info.id } })
  const find_admin = await TotalIncome.findOne({ where: { user_id: 1 } })
  const Selected = await Profile.findOne({
    where: { user_id: user_info.id, pkg: pkg },
    include: { model: Upgrade }
  });

  const SearchUser = await User.findOne({ where: { id: user_info.id } })

  const findReff = await Profile.findOne({
    where: { user_id: Selected.refferal },
    include: { model: wallet }
  });
  const adminWallet = await Profile.findOne({
    where: { user_id: 1 },
    include: { model: wallet }
  });

  //placement start
  let placements = [];
  let Placement_Upgrade = []
  let placement_check

  let placement = await Profile.findOne(
    {
      where: {
        [Sequelize.Op.or]: [
          { left: Selected.user_id, pkg: pkg },
          { right: Selected.user_id, pkg: pkg },
        ],
      },
      include: [
        { model: Pakage, attributes: ["pkg_name", "pkg_price"] },
        { model: Upgrade },
        { model: wallet },
      ],
    }
  );

  if (placement) {
    placements.push(placement);
  }

  for (let i = 2; i <= 16; i++) {

    if (!placement) {
      break;
    }
    placement = await Profile.findOne({
      where: {
        [Sequelize.Op.or]: [
          { left: placement.user_id, pkg: pkg },
          { right: placement.user_id, pkg: pkg },
        ],
      },
      include: [
        { model: Pakage, attributes: ["pkg_name", "pkg_price", "user_id"] },
        { model: Upgrade },
        { model: wallet },
      ],
    });
    if (placement) {
      placements.push(placement);
    }
  }

  const transactionUpgradeToAdmin = `Upgraded tax for admin from ${SearchUser.username}`
  const transactionFromReff = `Your Refferal  ${SearchUser.username} Upgraded a Package`
  const transactionUpgraded = `Package Upgraded from ${SearchUser.username}`
  const AllTaxAdmin = `All Tax's to Admin from ${SearchUser.username}`
  const Upgrade_pkg = `Upgraded package from ${SearchUser.username}`
  const Reff_pkg = `Referal fund from ${SearchUser.username}`
  const Taxforadminfrom = `Tax for admin from ${SearchUser.username}`
  const Placementforadminfrom = `Placement for admin from ${SearchUser.username}`
  const Reff_transac = `Refferal trasaction from ${SearchUser.username}`
  const placement_pay = `Placement payment from ${SearchUser.username}`
  const placement_Transaction = `Placement payment Transaction from ${SearchUser.username}`

  if (Selected.pkg == Upgrades4) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);

    //user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:Upgrade_Snippet_CUTT_TO_ALL(
          1,
          125,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
          )
          break
        case 1: Upgrade_Snippet_CUTT_TO_ALL(
          2,
          281.250,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: Upgrade_Snippet_CUTT_TO_ALL(
          3,
          632.813,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: Upgrade_Snippet_CUTT_TO_ALL(
          4,
          1423.828,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: Upgrade_Snippet_CUTT_TO_ALL(
          5,
          3203.613,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: Upgrade_Snippet_CUTT_TO_ALL(
          6,
          7208.130,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: Upgrade_Snippet_CUTT_TO_ALL(
          7,
          16218.292,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: Upgrade_Snippet_CUTT_TO_ALL(
          8,
          36491.158,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgraded successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 125
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 125,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 125,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 25
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 25 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Upgrade_pkg,
              payment: 31.250,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 87.5
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 87.5 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 93.750,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12.50
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 12.50 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 12.50,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 281.250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 281.250,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 281.250,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 56.250
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 56.250 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 70.313,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 196.875
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 196.875 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 210.938,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 28.125
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 28.125 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 28.125,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 632.813
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 632.813,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 632.813,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 126.563
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 126.563 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 158.203,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 442.969
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 442.969 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 474.609,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 63.281
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 63.281 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 63.281,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 1423.828
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 1423.828,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1423.828,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 284.766
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 284.766 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 355.957,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 996.680
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 996.680 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 1067.871,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 142.383
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 142.383 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 142.383,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 3203.613
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 3203.613,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3203.613,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 640.723
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 640.723 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 800.903,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 2242.529
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 2242.529 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 2402.710,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 320.361
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 320.361 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 320.361,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 7208.130
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 7208.130,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 7208.130,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 1441.626
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 1441.626 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1802.032,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 5045.691
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 5045.691 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 5406.097,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 720.813
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 720.813 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 720.813,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 16218.292
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 16218.292,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 16218.292,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 3243.658
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 3243.658 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 4054.573,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 11352.805
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 11352.805 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 12163.719,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1621.829
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1621.829 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1621.829,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 36491.158
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // // upradde transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 36491.158,
          //     user_id: user_info.id
          //   })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 36491.158,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 7298.232
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 7298.232 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 9122.789,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 25549.810
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 25549.810 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 27368.368,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 3649.116
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 3649.116 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 3649.116,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgraded successfully!'); // Send a success response
    }
  } else if (Selected.pkg == Upgrades1) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);
    // res.json(placement_check)
    // return false

    // user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 12.5
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 12.5,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2.5
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2.5 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 3.125,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1.250 + 8.75
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1.250 + 8.75 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1.250,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 8.75,
              user_id: user_info.id
            })

          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 28.125
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 28.125,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5.625
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 12.656 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 7.031,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2.813
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 6.382 + 44.297 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2.813,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 19.688,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 63.281
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 63.281,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 12.656
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 12.656 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 15.820,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.328 + 44.297
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 6.328 + 44.297 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 6.328,
              user_id: user_info.id
            })
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 44.297,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 142.383
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 142.383,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 82.47
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 82.47 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 35.596,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 41.238 + 99.668
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 41.238 + 99.668 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 41.238,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 99.668,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 320.361
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 320.361,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 64.072
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 64.072 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 80.090,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 32.036 + 224.253
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 32.036 + 224.253 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 32.036,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 224.253,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 720.813
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 720.813,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 144.163
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 144.163 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 180.203,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 72.081 + 504.569
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 72.081 + 504.569 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 72.081,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 504.569,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 1621.829
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1621.829,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 324.366
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 324.366 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 405.457,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 162.183 + 1135.280
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 162.183 + 1135.280 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 162.183,
              user_id: user_info.id
            })
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 1135.280,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 3649.116
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3649.116,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 729.823
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 729.823 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 912.279,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 364.912 + 2554.381
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 364.912 + 2554.381 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 364.912,
              user_id: user_info.id
            })
          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Placementforadminfrom,
              payment: 2554.381,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 12.5
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 12.5,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2.5
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2.5 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 3.125,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 8.75
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 8.75 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 9.375,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1.250
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1.250 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1.250,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 28.125
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 28.125,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5.625
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5.625 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 7.031,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 19.688
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 19.688 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 21.094,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2.813
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 2.813 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2.813,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 63.281
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 63.281,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 12.656
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 12.656 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 15.820,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 44.297
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 44.297 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 47.461,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.328
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 6.328 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 6.328,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 142.383
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 142.383,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 28.47
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 28.47 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 35.596,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 99.668
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 99.668 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 106.787,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 41.238
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 41.238 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 41.238,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 320.361
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 320.361,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 64.072
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 64.072 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 80.090,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 224.253
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 224.253 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 240.271,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 32.036
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 32.036 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 32.036,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 720.813
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 720.813,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 144.163
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 144.163 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 180.203,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 504.569
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 504.569 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 540.610,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 72.081
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 72.081 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 72.081,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 1621.829
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1621.829,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 324.366
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 324.366 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 405.457,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 1135.280
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 1135.280 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 1216.372,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 162.183
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 162.183 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 162.183,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 3649.116
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3649.116,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 729.823
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 729.823 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 912.279,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 2554.381
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 2554.381 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 2736.837,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 364.912
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 364.912 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 364.912,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  } else if (Selected.pkg == Upgrades2) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);

    //user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 25
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 25,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 25,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5.0
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5.0 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 6.250,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2.500 + 17.500
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 2.500 + 17.500 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2.500 + 17.500,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 56.250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 56.250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 56.250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 11.250
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 11.250 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 14.063,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 5.625 + 39.375
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 5.625 + 39.375 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 5.625 + 39.375,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 126.563
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 126.563,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 126.563,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 25.313
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 25.313 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 31.641,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12.656 + 88.594
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 12.656 + 88.594 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 12.656 + 88.594,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 284.766
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 284.766,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 284.766,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 56.953
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 56.953 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 71.191,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 28.477 + 199.336
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 28.477 + 199.336 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 28.477 + 199.336,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 640.723
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 640.723,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 640.723,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 128.145
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 128.145 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 160.181,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 64.072 + 448.506
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 64.072 + 448.506 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 64.072 + 448.506,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 1441.626
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1441.626,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1441.626,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 288.325
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 288.325 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 360.406,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 144.163 + 1009.138
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 144.163 + 1009.138 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 144.163 + 1009.138,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 3243.658
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3243.658,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3243.658,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 648.732
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 648.732 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 810.915,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 324.366 + 2270.561
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 324.366 + 2270.561 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 324.366 + 2270.561,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 7298.232
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 7298.232,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 7298.232,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 1459.646
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 1459.646 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1824.558,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 729.823 + 5108.762
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 729.823 + 5108.762 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 729.823 + 5108.762,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 25
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 25,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 25,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5.0
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5.0 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 6.250,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 17.500
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 17.500 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 18.750,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2.500
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 2.500 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2.500,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 56.250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 56.250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 56.250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 11.250
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 11.250 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 14.063,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 39.375
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 39.375 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 42.188,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 5.625
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 5.625 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 5.625,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 126.563
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 126.563,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 126.563,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 25.313
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 25.313 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 31.641,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 88.594
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 88.594 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 94.922,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12.656
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 12.656 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 12.656,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 284.766
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 284.766,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 284.766,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 56.953
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 56.953 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 71.191,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 199.336
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 199.336 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 213.574,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 28.477
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 28.477 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 28.477,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 640.723
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 640.723,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 640.723,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 128.145
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 128.145 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 160.181,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 448.506
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 448.506 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 480.542,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 64.072
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 64.072 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 64.072,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 1441.626
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1441.626,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1441.626,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 288.325
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 288.325 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 360.406,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 1009.138
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 1009.138 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 1081.219,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 144.163
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 144.163 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 144.163,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 3243.658
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3243.658,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3243.658,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 648.732
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 648.732 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 810.915,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 2270.561
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 2270.561 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 2432.744,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 324.366
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 324.366 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 324.366,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 7298.232
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 7298.232,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 7298.232,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 1459.646
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 1459.646 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1824.558,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 5108.762
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 5108.762 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 5473.674,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 729.823
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 729.823 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 729.823,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  } else if (Selected.pkg == Upgrades3) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);

    //user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 62.500
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 62.500,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 62.500,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 12.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 12.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 15.625,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.250 + 43.750
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 6.250 + 43.750 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 6.250 + 43.750,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 140.625
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 140.625,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 140.625,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 28.125
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 28.125 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 35.156,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 14.063 + 98.438
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 14.063 + 98.438 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 14.063 + 98.438,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 316.406
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 316.406,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 316.406,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 63.281
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 63.281 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 79.105,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 31.641 + 22.484
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 31.641 + 22.484 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 31.641 + 22.484,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 711.914
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 711.914,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 711.914,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 142.383
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 142.383 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 177.979,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 71.191 + 498.940
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 71.191 + 498.940 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 71.191 + 498.940,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 1601.807
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1601.807,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1601.807,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 320.361
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 320.361 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 400.452,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 160.181 + 1121.265
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 160.181 + 1121.265 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 160.181 + 1121.265,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 3604.065
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3604.065,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3604.065,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 7205.813
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 7205.813 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 901.016,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 360.406 + 2522.845
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 360.406 + 2522.845 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 360.406 + 2522.845,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 8109.146
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 8109.146,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 8109.146,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5676.402
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5676.402 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 2027.287,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 810.915 + 11352.80
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 810.915 + 11352.80 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 810.915 + 11352.80,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 18245.579
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 18245.579,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 18245.579,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 3649.116
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 3649.116 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 4561.395,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1824.558 + 12771.905
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1824.558 + 12771.905 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1824.558 + 12771.905,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 62.500
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 62.500,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 62.500,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 12.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 12.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 15.625,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 43.750
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 43.750 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 46.875,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.250
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 6.250 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 6.250,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 140.625
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 140.625,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 140.625,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 28.125
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 28.125 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 35.156,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 98.438
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 98.438 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 105.469,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 14.063
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 14.063 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 14.063,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 316.406
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 316.406,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 316.406,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 63.281
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 63.281 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 79.105,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 22.484
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 22.484 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 237.305,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 31.641
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 31.641 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 31.641,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 711.914
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 711.914,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 711.914,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 142.383
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 142.383 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 177.979,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 498.940
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 498.940 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 533.936,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 71.191
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 71.191 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 71.191,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 1601.807
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1601.807,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1601.807,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 320.361
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 320.361 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 400.452,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 1121.265
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 1121.265 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 1201.355,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 160.181
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 160.181 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 160.181,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 3604.065
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3604.065,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3604.065,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 7205.813
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 7205.813 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 901.016,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 2883.252
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 2883.252 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 2703.049,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 360.406
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 360.406 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 360.406,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 8109.146
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 8109.146,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 8109.146,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5676.402
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5676.402 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 2027.287,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 11352.80
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 11352.80 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 6081.860,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 810.915
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 810.915 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 810.915,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 18245.579
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 18245.579,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 18245.579,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 3649.116
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 3649.116 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 4561.395,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 12771.905
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 12771.905 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 13684.184,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1824.558
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1824.558 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1824.558,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  } else if (Selected.pkg == Upgrades5) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);

    //user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 50
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 50 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 62.500,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 25.00 + 175.00
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 25.00 + 175.00 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 25.00 + 175.00,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 281.250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 281.250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 281.250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 112.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 112.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 140.625,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 56.250 + 393.750
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 56.250 + 393.750 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 56.250 + 393.750,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 632.813
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 632.813,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 632.813,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 253.125
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 253.125 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 361.409,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 126.563 + 885.338
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 126.563 + 885.338 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 126.563 + 885.338,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 1423.828
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1423.828,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1423.828,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 569.531
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 569.531 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 711.914,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 284.766 + 1993.359
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 284.766 + 1993.359 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 284.766 + 1993.359,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 3203.613
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3203.613,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3203.613,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 1281.445
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 1281.445 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1601.807,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 640.723 + 4485.059
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 640.723 + 4485.059 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 640.723 + 4485.059,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 7208.130
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 7208.130,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 7208.130,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2883.252
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2883.252 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 3604.065,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1441.626 + 10091.382
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1441.626 + 10091.382 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1441.626 + 10091.382,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 16218.292
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 16218.292,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 16218.292,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 6487.317
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 6487.317 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 8109.146,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 3243.658 + 22705.609
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 3243.658 + 22705.609 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 3243.658 + 22705.609,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 36491.158
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 36491.158,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 36491.158,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 14596.463
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 14596.463 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 18245.579,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 7298.232 + 51087.621
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 7298.232 + 51087.621 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 7298.232 + 51087.621,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 50
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 50 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 62.500,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 175.00
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 175.00 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 187.500,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 25.00
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 25.00 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 25.00,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 281.250
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 281.250,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 281.250,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 112.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 112.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 140.625,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 393.750
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 393.750 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 421.875,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 56.250
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 56.250 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 56.250,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 632.813
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 632.813,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 632.813,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 253.125
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 253.125 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 361.409,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 885.338
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 885.338 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 949.219,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 126.563
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 126.563 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 126.563,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 1423.828
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 1423.828,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 1423.828,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 569.531
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 569.531 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 711.914,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 1993.359
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 1993.359 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 2135.742,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 284.766
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 284.766 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 284.766,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 3203.613
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 3203.613,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 3203.613,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 1281.445
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 1281.445 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1601.807,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 4485.059
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 4485.059 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 4805.420,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 640.723
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 640.723 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 640.723,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 7208.130
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 7208.130,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 7208.130,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2883.252
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2883.252 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 3604.065,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 10091.382
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 10091.382 },
            { where: { user_id: placement_check[0].user_id } }
          );


          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 10812.195,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1441.626
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1441.626 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1441.626,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 16218.292
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 16218.292,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 16218.292,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 6487.317
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 6487.317 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 8109.146,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 22705.609
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 22705.609 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 24327.438,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 3243.658
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 3243.658 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 3243.658,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 36491.158
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 36491.158,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 36491.158,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 14596.463
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 14596.463 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 18245.579,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 51087.621
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 51087.621 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 54736.736,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 7298.232
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 7298.232 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 7298.232,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  } else if (Selected.pkg == Upgrades6) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);

    //user ka level
    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 437.500
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 437.500,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 437.500,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 87.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 87.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 109.375,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 43.750 + 306.250
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 43.750 + 306.250 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 43.750 + 306.250,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 984.375
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 984.375,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 984.375,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 196.875
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 196.875 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 246.094,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 98.438 + 689.063
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 98.438 + 689.063 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 98.438 + 689.063,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 2214.844
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 2214.844,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 2214.844,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 442.969
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 442.969 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 553.711,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 221.484 + 1550.391
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 221.484 + 1550.391 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 221.484 + 1550.391,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 4983.398
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 4983.398,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 4983.398,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 996.680
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 996.680 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1245.850,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 498.340 + 3488.379
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 498.340 + 3488.379 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 498.340 + 3488.379,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 11212.646
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 11212.646,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 11212.646,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2242.529
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2242.529 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 2803.162,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1121.265 + 7084.853
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1121.265 + 7084.853 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1121.265 + 7084.853,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 25228.455
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 25228.455,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 25228.455,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5045.691
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5045.691 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 6307.114,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2522.845 + 17659.918
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 2522.845 + 17659.918 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2522.845 + 17659.918,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 56764.023
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 56764.023,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 56764.023,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 11352.805
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 11352.805 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 14191.006,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 5676.402 + 39734.816
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 5676.402 + 39734.816 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 5676.402 + 39734.816,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 127719.051
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 127719.051,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 127719.051,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 25543.810
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 25543.810 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 31929.763,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12771.905 + 89403.336
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 12771.905 + 89403.336 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 12771.905 + 89403.336,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0:
          //upgrade levels
          await Upgrade.update({
            level: 1,
            upgrade: 437.500
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 437.500,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 437.500,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 87.500
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 87.500 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 109.375,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 306.250
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 306.250 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 328.125,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 43.750
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 43.750 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 43.750,
              user_id: user_info.id
            })
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 984.375
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 984.375,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 984.375,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 196.875
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 196.875 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 246.094,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 689.063
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 689.063 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 738.281,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 98.438
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 98.438 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 98.438,
              user_id: user_info.id
            })
          break
        case 2:
          //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 2214.844
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // //upgrade levels transaction
          // await Transaction.create(
          //   {
          //     from: user_info.id,
          //     to: 1,
          //     reason: Upgrade_pkg,
          //     payment: 2214.844,
          //     user_id: user_info.id
          //   })
          //upgrade levels transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 2214.844,
              user_id: user_info.id
            })
          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 442.969
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 442.969 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_pkg,
              payment: 553.711,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 1550.391
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 1550.391 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_pay,
              payment: 1661.133,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 221.484
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 221.484 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 221.484,
              user_id: user_info.id
            })
          break
        case 3:
          //upgrade levels
          await Upgrade.update({
            level: 4,
            upgrade: 4983.398
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 4983.398,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 4983.398,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 996.680
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 996.680 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 1245.850,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 3488.379
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 3488.379 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 3737.549,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 498.340
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 498.340 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 498.340,
              user_id: user_info.id
            })
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 11212.646
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 11212.646,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 11212.646,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 2242.529
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 2242.529 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 2803.162,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 7084.853
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 7084.853 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 8409.485,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1121.265
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 1121.265 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 1121.265,
              user_id: user_info.id
            })
          break
        case 5:
          //upgrade levels
          await Upgrade.update({
            level: 6,
            upgrade: 25228.455
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 25228.455,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 25228.455,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 5045.691
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 5045.691 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 6307.114,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 17659.918
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 17659.918 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 18921.341,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2522.845
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 2522.845 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 2522.845,
              user_id: user_info.id
            })
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 56764.023
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 56764.023,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 56764.023,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 11352.805
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 11352.805 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 14191.006,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 39734.816
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 39734.816 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 42513.017,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 5676.402
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 5676.402 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 5676.402,
              user_id: user_info.id
            })
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 127719.051
          }, {
            where:
            {
              user_id: user_info.id,
              pkg_price: pkg
            }
          }
          )
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Upgrade_pkg,
              payment: 127719.051,
              user_id: user_info.id
            })
          // upradde transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: user_info.id,
              reason: Upgrade_pkg,
              payment: 127719.051,
              user_id: user_info.id
            })

          //payment to referal
          await wallet.update(
            {
              payment: findReff.wallet.payment + 25543.810
            }
            ,
            {
              where: {
                user_id: findReff.id
              }
            })
          // payment in 
          await TotalIncome.update(
            { income: find_income.income + 25543.810 },
            { where: { user_id: findReff.id } }
          );
          //payment refferal transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: findReff.id,
              reason: Reff_transac,
              payment: 31929.763,
              user_id: user_info.id
            })
          // placement wallet
          await wallet.update(
            {
              payment: placement_check[0].wallet.payment + 89403.336
            }
            ,
            {
              where: {
                user_id: placement_check[0].user_id
              }
            })
          // placement wala
          await TotalIncome.update(
            { income: find_income.income + 89403.336 },
            { where: { user_id: placement_check[0].user_id } }
          );

          // placement transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: placement_check[0].user_id,
              reason: placement_Transaction,
              payment: 95789.289,
              user_id: user_info.id
            })
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12771.905
            }
            ,
            {
              where: {
                user_id: 1
              }
            })
          //admin total income
          await TotalIncome.update(
            { income: find_admin.income + 12771.905 },
            { where: { user_id: 1 } }
          );

          // admin wallet transaction
          await Transaction.create(
            {
              from: user_info.id,
              to: 1,
              reason: Taxforadminfrom,
              payment: 12771.905,
              user_id: user_info.id
            })
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }
};

const Upgrade_Snippet_CUTT_TO_ALL = async (
  level,
  Upgrade_Price,
  user_id,
  pkg_price,
  findReff,
  find_admin,
  find_income,
  adminWallet,
  transactionUpgradeToAdmin,
  transactionFromReff,
  AllTaxAdmin,
  Upgrade_pkg,
  Taxforadminfrom
) => {

  let IF_ONLY_ADMIN_CUTT, IF_ONLY_ADMIN_REFF_CUTT, IF_ONLY_ADMIN_Direct,IF_ONLY_ADMIN_placement

  IF_ONLY_ADMIN_Direct = Upgrade_Price * 0.25
  IF_ONLY_ADMIN_placement = Upgrade_Price * 0.75
  IF_ONLY_ADMIN_CUTT = Upgrade_Price * 0.80
  IF_ONLY_ADMIN_REFF_CUTT = Upgrade_Price * 0.20

  //upgrade levels
  await Upgrade.update({
    level: 1,
    upgrade: 12.5
  }, {
    where:
    {
      user_id,
      pkg_price
    }
  }
  )
  //upgrade levels transaction
  await Transaction.create(
    {
      from: user_id,
      to: user_id,
      reason: Upgrade_pkg,
      payment: Upgrade_Price,
      user_id: user_id
    })
  //payment to referal
  await wallet.update(
    {
      payment: findReff.wallet.payment + 2.5
    }
    ,
    {
      where: {
        user_id: findReff.id
      }
    })
  // payment in 
  await TotalIncome.update(
    { income: find_income.income + 2.5 },
    { where: { user_id: findReff.id } }
  );
  //payment refferal transaction
  await Transaction.create(
    {
      from: user_id,
      to: findReff.id,
      reason: Reff_pkg,
      payment: 3.125,
      user_id: user_id
    })
  // admin wallet
  await wallet.update(
    {
      payment: adminWallet.wallet.payment + IF_ONLY_ADMIN_CUTT
    }
    ,
    {
      where: {
        user_id: 1
      }
    })
  //admin total income
  await TotalIncome.update(
    { income: find_admin.income + IF_ONLY_ADMIN_CUTT },
    { where: { user_id: 1 } }
  );

  // admin wallet transaction
  await Transaction.create(
    {
      from: user_id,
      to: 1,
      reason: Taxforadminfrom,
      payment: IF_ONLY_ADMIN_Direct,
      user_id
    })
  // admin wallet transaction
  await Transaction.create(
    {
      from: user_id,
      to: 1,
      reason: Placementforadminfrom,
      payment: IF_ONLY_ADMIN_placement,
      user_id
    })

}

const Upgrade_Snippet = async (req, res) => {
  let IF_ONLY_ADMIN_CUTT, IF_ONLY_ADMIN_REFF_CUTT
  const value = "100.202"
  const check = parseFloat(value)
  const add = check + 100

  IF_ONLY_ADMIN_CUTT = parseInt(value) + 0.10
  IF_ONLY_ADMIN_REFF_CUTT = value + 0.90

  res.json({ check })
  // res.json({IF_ONLY_ADMIN_CUTT , IF_ONLY_ADMIN_REFF_CUTT})
}

const Withdraw = async (req, res) => {
  const { Withdraw_payment } = req.body
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)

  const Find_withdraw = await wallet.findOne({ where: { user_id: user_info.id } })
  const Find_total_withdraw = await TotalWithdraw.findOne({ where: { user_id: user_info.id } })
  const admin = await wallet.findOne({ where: { user_id: 1 } })

  const percentage5 = Withdraw_payment * 0.05;

  if (Withdraw_payment > 0) {
    if (Find_withdraw.payment > Withdraw_payment) {
      await wallet.update(
        { payment: Find_withdraw.payment - Withdraw_payment },
        { where: { user_id: user_info.id } }
      )
      await wallet.update(
        { payment: admin.payment + percentage5 },
        { where: { user_id: 1 } }
      )
      await TotalWithdraw.update({
        withdraw: Find_total_withdraw.withdraw + Withdraw_payment
      }, {
        where: { user_id: user_info.id }
      })
      await Transaction.create({
        from: 1,
        to: user_info.id,
        reason: `You have withdraw ${Withdraw_payment}`,
        payment: Withdraw_payment,
        user_id: user_info.id
      })
      res.json({ msg: "Withdraw Successfully!" })
    } else {
      res.json({ msg: "You don't have enough amount" })
    }
  } else {
    res.json({ msg: "Please mention amount" })
  }
}
const purchase_PKG = async (pkg, user_info, pkg_name, res) => {
  let ReffkWallets1, reffKharcha, placementKharcha

  const SearchUser = await User.findOne({ where: { id: user_info.id } })
  const Real_profile = await Profile.findOne({ where: { user_id: user_info.id, pkg: pkg } })

  const find_Admin_income = await TotalIncome.findOne({ where: { user_id: 1 } })
  let find_income
  if (Real_profile) {
    res.json('Package Found!')
  } else {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pkg,
      },
    });

    ReffkWallets1 = await Refferal.findOne({
      where: { user_id: user_info.id },
      attributes: ['user_id', 'refferal'],
      include: {
        model: User,
        as: 'directReffUser',
        attributes: ['id', 'username'],
        include: {
          model: wallet,
          as: 'reff',
          attributes: ['payment', 'user_id'],
        },
      },
    });
    const percentage10 = pkg * 0.10;
    const percentage45 = pkg * 0.45
    const percentage55 = pkg * 0.55
    const percentage90 = pkg * 0.90

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx
      const Reff = await Refferal.findOne({
        where: { user_id: user_info.id },
        attributes: ['user_id', 'refferal'],
        include: {
          model: User,
          as: 'directReffUser',
          attributes: ['id', 'username'],
          include: {
            model: wallet,
            as: 'reff',
            attributes: ['payment', 'user_id'],
          },
        },
      });
      const usermake = await Profile.create({
        refferal: Reff.directReffUser.id,
        pkg: pkg,
        user_id: user_info.id,
        username: SearchUser.username,
      });

      await Upgrade.update({
        profile_id: usermake.id,
        upgrade: 0,
        level: 0,
        package: true
      }, {
        where: {
          user_id: user_info.id,
          pkg_price: pkg,
        }
      });
      await Profile.update({
        right: usermake.user_id
      }, {
        where: {
          user_id: findRight.user_id,
          pkg: pkg,
        }
      });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pkg,
        pkg_name: pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      find_income = await TotalIncome.findOne({ where: { user_id: findRight.user_id } })

      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.user_id },
      })

      if (Reff.directReffUser.id == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + percentage55 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await TotalIncome.update(
          { income: find_Admin_income.income + percentage55 },
          { where: { user_id: adminkWallets1.user_id } }
        );

        // 55% to admin
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: `commision with tax from ${SearchUser.username}`,
          payment: percentage55,
          user_id: user_info.id,
        });

        //own transaction
        await Transaction.create({
          from: user_info.id,
          to: user_info.id,
          reason: "Purchased Package",
          payment: pkg,
          user_id: user_info.id,
        });

        //transaction
        await Transaction.create({
          from: user_info.id,
          to: findRight.user_id,
          reason: `Placement Fund from ${SearchUser.username}`,
          payment: percentage45,
          user_id: findRight.user_id,
        });

        //transaction for placement
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.user_id } }
        ); // 45% for placement

        await TotalIncome.update(
          { income: find_income.income + percentage45 },
          { where: { user_id: findRight.user_id } }
        );

      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin

        await TotalIncome.update(
          { income: find_Admin_income.income + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        );

        //transactions
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: `tax for admin ${SearchUser.username}`,
          payment: percentage10,
          user_id: 1,
        });

        //transactions
        await Transaction.create({
          from: user_info.id,
          to: Reff.directReffUser.id,
          reason: `Refferal Fund from ${SearchUser.username}`,
          payment: percentage45,
          user_id: Reff.directReffUser.id,
        });
        placementKharcha = await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.user_id } }
        ); // 45% for placement
        await TotalIncome.update(
          { income: find_income.income + percentage45 },
          { where: { user_id: findRight.user_id } }
        );
        if (placementKharcha) {
          const innerReff = await Refferal.findOne({
            where: { user_id: user_info.id },
            attributes: ['user_id', 'refferal'],
            include: {
              model: User,
              as: 'directReffUser',
              attributes: ['id', 'username'],
              include: {
                model: wallet,
                as: 'reff',
                attributes: ['payment', 'user_id'],
              },
            },
          });
          find_income = await TotalIncome.findOne({ where: { user_id: innerReff.directReffUser.id } })
          await wallet.update(
            { payment: innerReff.directReffUser.reff.payment + percentage45 },
            { where: { user_id: innerReff.directReffUser.id } }
          ); // 45% for direct refferal

          await TotalIncome.update(
            { income: find_income.income + percentage45 },
            { where: { user_id: innerReff.directReffUser.id } }
          );
        }


        //transactions
        await Transaction.create({
          from: user_info.id,
          to: findRight.user_id,
          reason: `placement Fund from ${SearchUser.username}`,
          payment: percentage45,
          user_id: findRight.user_id,
        });

        await Transaction.create({
          from: "Blockchain Wallet",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: pkg,
          user_id: user_info.id,
        });

      }

      res.status(200).json({ msg: `from Right of ${pkg}`, findRight, reffKharcha });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pkg,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const Reff = await Refferal.findOne({
          where: { user_id: user_info.id },
          attributes: ['user_id', 'refferal'],
          include: {
            model: User,
            as: 'directReffUser',
            attributes: ['id', 'username'],
            include: {
              model: wallet,
              as: 'reff',
              attributes: ['payment', 'user_id'],
            },
          },
        });
        const usermake = await Profile.create({
          refferal: Reff.directReffUser.id,
          pkg: pkg,
          user_id: user_info.id,
          username: SearchUser.username,
        });
        await Upgrade.update({
          profile_id: usermake.id,
          upgrade: 0,
          level: 0,
          package: true
        }, {
          where: {
            user_id: user_info.id,
            pkg_price: pkg,
          }
        });
        await Profile.update({
          left: usermake.user_id
        }, {
          where: {
            user_id: findLeft.user_id,
            pkg: pkg,
          }
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pkg,
          pkg_name: pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });

        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.user_id },
        })

        find_income = await TotalIncome.findOne({ where: { user_id: findLeft.user_id } })

        if (Reff.directReffUser.id == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await TotalIncome.update(
            { income: find_Admin_income.income + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          );

          // 55% to admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: `commision with tax from ${SearchUser.username}`,
            payment: percentage55,
            user_id: user_info.id,
          });

          //own transaction
          await Transaction.create({
            from: user_info.id,
            to: user_info.id,
            reason: "Purchased Package",
            payment: pkg,
            user_id: user_info.id,
          });
          //transaction
          await Transaction.create({
            from: user_info.id,
            to: findLeft.user_id,
            reason: `Placement Fund from ${SearchUser.username}`,
            payment: percentage45,
            user_id: findLeft.user_id,
          });

          //transaction for placement
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.user_id } }
          ); // 45% for placement

          await TotalIncome.update(
            { income: find_income.income + percentage45 },
            { where: { user_id: findLeft.user_id } }
          );


        } else {

          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin

          await TotalIncome.update(
            { income: find_Admin_income.income + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          );

          //transaction
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: `Tax to admin ${SearchUser.username}`,
            payment: percentage10,
            user_id: 1,
          });

          //transaction
          await Transaction.create({
            from: user_info.id,
            to: Reff.directReffUser.id,
            reason: `Refferal Fund from ${SearchUser.username}`,
            payment: percentage45,
            user_id: Reff.directReffUser.id,
          });
          placementKharcha = await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.user_id } }
          ); // 45% for placement

          await TotalIncome.update(
            { income: find_income.income + percentage45 },
            { where: { user_id: findLeft.user_id } }
          );

          if (placementKharcha) {
            const innerReff = await Refferal.findOne({
              where: { user_id: user_info.id },
              attributes: ['user_id', 'refferal'],
              include: {
                model: User,
                as: 'directReffUser',
                attributes: ['id', 'username'],
                include: {
                  model: wallet,
                  as: 'reff',
                  attributes: ['payment', 'user_id'],
                },
              },
            });
            find_income = await TotalIncome.findOne({ where: { user_id: innerReff.directReffUser.id } })
            await wallet.update(
              { payment: innerReff.directReffUser.reff.payment + percentage45 },
              { where: { user_id: innerReff.directReffUser.id } }
            ); // 45% for direct refferal

            await TotalIncome.update(
              { income: find_income.income + percentage45 },
              { where: { user_id: innerReff.directReffUser.id } }
            );
          }

          //transaction
          await Transaction.create({
            from: user_info.id,
            to: findLeft.user_id,
            reason: `Placement Fund from ${SearchUser.username}`,
            payment: percentage45,
            user_id: findLeft.user_id,
          });


          await Transaction.create({
            from: "Blockchain Wallet",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: pkg,
            user_id: user_info.id,
          });
        }

        res.json({ msg: `from Left of ${pkg}`, findLeft, reffKharcha });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const Reff = await Refferal.findOne({
          where: { user_id: user_info.id },
          attributes: ['user_id', 'refferal'],
          include: {
            model: User,
            as: 'directReffUser',
            attributes: ['id', 'username'],
            include: {
              model: wallet,
              as: 'reff',
              attributes: ['payment', 'user_id'],
            },
          },
        });
        const usermake = await Profile.create({
          refferal: Reff.directReffUser.id,
          pkg: pkg,
          user_id: user_info.id,
          username: SearchUser.username,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pkg,
          pkg_name: pkg_name,
        });
        await Upgrade.update({
          profile_id: usermake.id,
          upgrade: 0,
          level: 0,
          package: true
        }, {
          where: {
            user_id: user_info.id,
            pkg_price: pkg,
          }
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });

        const percentage55 = pkg * 0.55
        const percentage45 = pkg * 0.45
        find_income = await TotalIncome.findOne({ where: { user_id: Reff.directReffUser.id } })
        const find_income_admin = await TotalIncome.findOne({ where: { user_id: 1 } })
        if (Reff.directReffUser.id == 1) {
          // res.json({check:find_income_admin.income + pkg})
          // return false
          await wallet.update(
            { payment: adminkWallets1.payment + pkg },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await TotalIncome.update(
            { income: find_income_admin.income + pkg },
            { where: { user_id: find_income_admin.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: `commision with tax from ${SearchUser.username}`,
            payment: pkg,
            user_id: user_info.id,
          });
          await Transaction.create({
            from: user_info.id,
            to: user_info.id,
            reason: "Package Purchased",
            payment: pkg,
            user_id: user_info.id,
          })

        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 55% for admin

          await TotalIncome.update(
            { income: find_Admin_income.income + percentage55 },
            { where: { user_id: find_Admin_income.user_id } }
          );

          await wallet.update(
            { payment: Reff.directReffUser.reff.payment + percentage45 },
            { where: { user_id: Reff.directReffUser.id } }
          ); // 45% for user

          await TotalIncome.update(
            { income: find_income.income + percentage45 },
            { where: { user_id: find_income.user_id } }
          );

          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: `tax for admin from ${SearchUser.username} for package ${pkg}`,
            payment: percentage55,
            user_id: 1,
          });

          await Transaction.create({
            from: user_info.id,
            to: Reff.directReffUser.id,
            reason: `Your Refferal ${SearchUser.username} Purchased a package for ${pkg}`,
            payment: percentage45,
            user_id: user_info.id,
          });

          await Transaction.create({
            from: "Blockchain Wallet",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: pkg,
            user_id: user_info.id,
          });
        }

        res.status(200).json({ msg: "no space found", usermake });
      }
    }
  }
}

const placementInvest = async (req, res) => {
  const { pkg, pkg_name } = req.body;

  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);
  purchase_PKG(pkg, user_info, pkg_name, res)

};

const Pakage_info = async (req, res) => {

  const { pkg } = req.body
  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);
  const findUpdate = await Upgrade.findOne({
    where: { user_id: user_info.id, pkg_price: pkg },
    attributes: ['pkg_price', 'level', 'pkg_price']
  })
  let NextPackage

  if (findUpdate.pkg_price == 10) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 12.5;
        break;
      case (findUpdate.level == 1):
        NextPackage = 28.125;
        break;
      case (findUpdate.level == 2):
        NextPackage = 63.281;
        break;
      case (findUpdate.level == 3):
        NextPackage = 142.383;
        break;
      case (findUpdate.level == 4):
        NextPackage = 320.361;
        break;
      case (findUpdate.level == 5):
        NextPackage = 720.813;
        break;
      case (findUpdate.level == 6):
        NextPackage = 1621.829;
        break;
      case (findUpdate.level == 7):
        NextPackage = 3649.116;
        break;
      default:
        NextPackage = 12.5;
        break;
    }
  } else if (findUpdate.pkg_price == 20) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 25;
        break;
      case (findUpdate.level == 1):
        NextPackage = 56.250;
        break;
      case (findUpdate.level == 2):
        NextPackage = 126.563;
        break;
      case (findUpdate.level == 3):
        NextPackage = 284.766;
        break;
      case (findUpdate.level == 4):
        NextPackage = 640.723;
        break;
      case (findUpdate.level == 5):
        NextPackage = 1441.626;
        break;
      case (findUpdate.level == 6):
        NextPackage = 3243.658;
        break;
      case (findUpdate.level == 7):
        NextPackage = 7298.232;
        break;
      default:
        NextPackage = 25;
        break;
    }
  } else if (findUpdate.pkg_price == 50) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 62.500;
        break;
      case (findUpdate.level == 1):
        NextPackage = 140.625;
        break;
      case (findUpdate.level == 2):
        NextPackage = 316.406;
        break;
      case (findUpdate.level == 3):
        NextPackage = 711.914;
        break;
      case (findUpdate.level == 4):
        NextPackage = 1601.807;
        break;
      case (findUpdate.level == 5):
        NextPackage = 3604.065;
        break;
      case (findUpdate.level == 6):
        NextPackage = 8109.065;
        break;
      case (findUpdate.level == 7):
        NextPackage = 18245.579;
        break;
      default:
        NextPackage = 62.500;
        break;
    }
  } else if (findUpdate.pkg_price == 100) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 125;
        break;
      case (findUpdate.level == 1):
        NextPackage = 281.250;
        break;
      case (findUpdate.level == 2):
        NextPackage = 632.813;
        break;
      case (findUpdate.level == 3):
        NextPackage = 1423.828;
        break;
      case (findUpdate.level == 4):
        NextPackage = 3203.613;
        break;
      case (findUpdate.level == 5):
        NextPackage = 7208.130;
        break;
      case (findUpdate.level == 6):
        NextPackage = 16218.292;
        break;
      case (findUpdate.level == 7):
        NextPackage = 36491.158;
        break;
      default:
        NextPackage = 125;
        break;
    }
  } else if (findUpdate.pkg_price == 200) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 250;
        break;
      case (findUpdate.level == 1):
        NextPackage = 281.250;
        break;
      case (findUpdate.level == 2):
        NextPackage = 632.813;
        break;
      case (findUpdate.level == 3):
        NextPackage = 1423.828;
        break;
      case (findUpdate.level == 4):
        NextPackage = 3203.613;
        break;
      case (findUpdate.level == 5):
        NextPackage = 7208.130;
        break;
      case (findUpdate.level == 6):
        NextPackage = 16218.292;
        break;
      case (findUpdate.level == 7):
        NextPackage = 36491.158;
        break;
      default:
        NextPackage = 250;
        break;
    }
  } else if (findUpdate.pkg_price == 350) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 437.500;
        break;
      case (findUpdate.level == 1):
        NextPackage = 984.375;
        break;
      case (findUpdate.level == 2):
        NextPackage = 2214.844;
        break;
      case (findUpdate.level == 3):
        NextPackage = 4983.398;
        break;
      case (findUpdate.level == 4):
        NextPackage = 11212.646;
        break;
      case (findUpdate.level == 5):
        NextPackage = 25228.455;
        break;
      case (findUpdate.level == 6):
        NextPackage = 56764.023;
        break;
      case (findUpdate.level == 7):
        NextPackage = 127719.051;
        break;
      default:
        NextPackage = 437.500;
        break;
    }
  }

  res.json({ findUpdate, NextPackage })
}
const update_profile = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const { full_name, email, phone, wallet_address } = req.body
  await User_Profile.update({
    full_name, email, phone, wallet_address
  }, {
    where: { user_id: user_info.id }
  })
  res.json({ msg: 'Profile updated' })
}
// ----------------- TREND START
const ShowReff = async (req, res) => {
  const userfind = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userfind);
  const { pkg } = req.body

  const user = await Profile.findOne({
    where: { user_id: user_info.id, pkg: pkg },
    // attributes: ["username", "left", "right"],
    include: [
      {
        model: Refferal,
        as: "left_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
        include: {
          model: User,
          as: 'User',
          attributes: ['username']
        }
      },
      {
        model: Refferal,
        as: "right_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
        include: {
          model: User,
          as: 'User',
          attributes: ['username']
        }
      },
      {
        model: User,
        as: 'User',
        attributes: ['username']
      }
    ],
  });
  res.status(200).json(user);
};
const getUserByTrend = async (req, res) => {
  const pkg = req.body.pkg;
  const UserID = req.body.UserID;
  const Users = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(Users)


  const user = await Profile.findOne({
    where: { user_id: UserID, pkg: pkg },

    include: [
      {
        model: Refferal,
        as: "left_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
        include: {
          model: User,
          as: 'User',
          attributes: ['username']
        }
      },
      {
        model: Refferal,
        as: "right_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
        include: {
          model: User,
          as: 'User',
          attributes: ['username']
        }
      },
      {
        model: User,
        as: 'User',
        attributes: ['username']
      }
    ],
  })
  res.status(200).json(user);
};
// -----------------TREND END

const isActivate = async (req, res) => {
  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);

  const activate = await User_Profile.findOne({
    where: { user_id: user_info.id }
  })
  if (activate.activate == true) {
    res.json({ msg: 'activated' })
  } else {
    res.json({ msg: 'not activated' })
  }
}
const testTrend = async (req, res) => {
  const pkg = req.body.pkg;
  const UserID = req.body.UserID;
  const Users = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(Users)

  let placements = []

  let placement = await Profile.findOne(
    {
      where: {
        [Sequelize.Op.or]: [
          { left: UserID },
          { right: UserID },
        ],
      },
      include: [
        {
          model: Upgrade,
          where: { pkg_price: pkg }
        },
      ],
    }
  );

  if (placement) {
    placements.push(placement);
  }

  for (let i = 2; i <= 16; i++) {

    if (!placement) {
      break;
    }
    placement = await Profile.findOne({
      where: {
        [Sequelize.Op.or]: [
          { left: placement.user_id },
          { right: placement.user_id },
        ],
      },
      include: [
        { model: Upgrade, where: { pkg_price: pkg } }
      ],
    });
    if (placement) {
      placements.push(placement);
    }
  }
  res.json(placements);

};
const wallets = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  const Walletx = await wallet.findOne({ where: { user_id: user_info.id } });
  res.json(Walletx);
};
const profileInfo = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  let total_income, total_withdrawal, date_register, Last_withdraw_time

  total_income = await TotalIncome.findOne({ where: { user_id: user_info.id } })
  total_withdrawal = await TotalWithdraw.findOne({ where: { user_id: user_info.id } })
  date_register = await User.findOne({ where: { id: user_info.id } })
  Last_withdraw_time = total_withdrawal.updatedAt

  res.json({ total_income: total_income.income, total_withdrawal: total_withdrawal.withdraw, date_register: date_register.createdAt, Last_withdraw_time })
};

const Placements = async (req, res) => {
  const user = await Profile.findOne({
    where: { id: req.body.id },
    include: [
      {
        model: Refferal,
        as: "Refferal",
        include: [{ model: Profile, as: "directReff" }],
      },
    ],
  });

  const placements = [];

  let placement = await Profile.findOne({
    // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
    where: {
      [Sequelize.Op.or]: [{ left: user.user_id }, { right: user.user_id }],
    },
    include: [{ model: Pakage, attributes: ["pkg_name", "pkg_price"] }],
    include: [{ model: Upgrade }],
  });
  if (!placement) {
    null;
  } else {
    placements.push(placement);
  }

  for (let i = 2; i <= 8; i++) {
    if (!placement) {
      break;
    }
    placement = await Profile.findOne({
      // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
      where: {
        [Sequelize.Op.or]: [{ left: placement.id }, { right: placement.id }],
      },
      include: [{ model: Pakage, attributes: ["pkg_name", "pkg_price"] }],
      include: [{ model: Upgrade }],
    });
    if (!placement) {
      null;
    } else {
      placements.push(placement);
    }
  }
  res.status(200).json({
    placements,
  });
};

const FindUserPakage = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  let pkg_check = "all found"


  const findPkg = await Upgrade.findOne({ where: { user_id: user_info.id } })
  const find_income = await TotalIncome.findOne({ where: { user_id: user_info.id } })
  const find_withdraw = await TotalWithdraw.findOne({ where: { user_id: user_info.id } })
  const find_Admin_income = await TotalIncome.findOne({ where: { user_id: 1 } })

  if (!find_Admin_income) {
    await TotalWithdraw.create({
      user_id: 1,
      withdraw: 0
    })
    await TotalIncome.create({
      user_id: 1,
      income: 0
    })
  }
  if (!findPkg) {
    pkg_check = await Upgrade.bulkCreate([
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices1,
        level: 0,
        package: false
      },
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices2,
        level: 0,
        package: false
      },
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices3,
        level: 0,
        package: false
      },
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices4,
        level: 0,
        package: false
      },
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices5,
        level: 0,
        package: false
      },
      {
        user_id: user_info.id,
        profile_id: 0,
        upgrade: 0,
        pkg_price: pakage_prices6,
        level: 0,
        package: false
      }
    ])
  }
  const packages = await Upgrade.findAll({
    where: { user_id: user_info.id }
  });

  if (!find_income) {
    await TotalIncome.create({
      user_id: user_info.id,
      income: 0
    })
  }

  if (!find_withdraw) {
    await TotalWithdraw.create({
      user_id: user_info.id,
      withdraw: 0
    })
  }


  res.status(200).send({ packages, pkg_check });
};

async function sendVerificationEmail(email, code, UserID, User) {
  // Configure Nodemailer with your email service details

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    auth: {
      user: 'waleed.naseem1@gmail.com',
      pass: 'ualrrsguaiqfzaje',
    },
  });
  // Define the email content
  const mailOptions = {
    from: '"smartxblockchain" <waleed.naseem1@gmail.com>',
    to: email,
    subject: 'Email Verification',
    // text: `Your verification code is: ${code}`,
    html: `
      <!DOCTYPE html>
<html>
<head>
  <title>Email Verification</title>
  <style>
    /* Add any custom styles here */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 90%;
      margin: 0 auto;
      padding-left: 20px;
      padding-right: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      color: #672626;
    }
    .containerInner {
      width: 85%;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      text-align: center;
      border-radius: 5px;
      background-color: #672626;
      color: #fff;
    }
    .containerflex {
      display: block;
      align-items: center;
      text-align: center;
      width: 100%;
    }
    .hiOPT{
      margin-top:20px;
      margin-bottom:20px
    }
    ._Regards{
      display:block;
      align-items:center;
      margin-top:10;
      margin-bottom:20
    }
    .name {
      color: #000;
      font-size: 25px;
      font-weight: bold;
      font-family: 'Times New Roman', Times, serif;
    }
    .Regards {
      color: #000;
      font-size: 30px;
      font-weight: bold;
      font-family: 'Times New Roman', Times, serif;
    }
    .Regards2 {
      color: #000;
      font-size: 20px;
      font-weight: 600;
      font-family: 'Times New Roman', Times, serif;
    }
    .OTPhead {
      color: #381313;
      font-size: 30px;
      font-weight: bold;
      font-family: 'Times New Roman', Times, serif;
    }
    .OTP {
      color: #672626;
      font-size: 30px;
      font-weight: bold;
      font-family: 'Times New Roman', Times, serif;
      text-align: center;
      padding: 2px;
      border: 1px solid #672626;
      border-radius: 10px;
      margin-top: 13px;
      margin-bottom: 13px;
      padding-bottom: 10px;
    }
    .logo {
      display: block;
      max-width: 80px;
      margin: 0 auto;
    }
    .logo2 {
      display: block;
      max-width: 30px;
      margin: 0 auto;
    }
    .pati {
      width: 30px;
      height: 2px;
      background-color: #fff;
    }
    .message {
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background-color: #672626;
      color: #ffffff;
      padding: 5px 20px;
      text-decoration: none;
    }
  </style>
</head>
<body>
   <div class="container">
      <img style={{ marginBottom: "20px", marginTop: 5 }} class="logo" src="https://www.smartxblockchain.com/images/smart(1).png" />

      <div class="containerflex">
        <div class="containerInner">
          <div>
            <img class="logo2" src="https://icon-library.com/images/message-icon-png/message-icon-png-8.jpg" />
          </div>
          <div> Verify Your OTP CODE</div>
        </div>

        <div class="hiOPT" >
          <div class="name">hi, ${User.username}</div>
          <div class="OTPhead">Your OTP is :</div>
          <div class="OTP">${code}</div>
        </div>

        <div class="_Regards">
          <div class="Regards">Regards </div>
          <div class="Regards2">Smartxblockchain </div>
        </div>

        <div class="containerInner">
          <div> Copyrights © Smartxblockchain - All Rights Reserved</div>
        </div>
      </div>
    </div>
</body>
</html>

    `
  };

  await User_Profile.update({
    email_opt: code
  }, { where: { user_id: UserID } })
  // Send the email
  return transporter.sendMail(mailOptions);
}

// Function to generate a random verification code
function generateVerificationCode() {
  const codeLength = 6;
  const digits = '0123456789';
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }

  return code;
}

const verifyEmail = async (req, res) => {
  const { email } = req.body
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)

  const name = await User.findOne({ where: { id: user_info.id } })

  const verificationCode = generateVerificationCode();

  sendVerificationEmail(email, verificationCode, user_info.id, name)
    .then(() => {
      res.json({ message: 'Verification email sent' });
    })
    .catch((error) => {
      res.json({ message: 'Failed to send verification email', error });
    });
}
const verifyCode = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const { code, email, full_name, phone, address, wallet_address } = req.body
  const verify = await User_Profile.findOne({ where: { user_id: user_info.id, email_opt: code } })
  if (verify) {
    await User_Profile.update({ activate: true, email, full_name, phone, address, wallet_address }, { where: { user_id: verify.user_id } })

    res.json({ msg: "Verified successfully !" })
  } else {
    res.json({ msg: "Validation code error !" })
  }
}

const Get_userProfile = async (req, res) => {

  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const getProfile = await User_Profile.findOne({
    where: {
      user_id: user_info.id
    }
  })
  res.json(getProfile)
}


const findTransac = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  const transaction = await Transaction.findAll({
    where: { to: user_info.id },
  });
  res.json(transaction);
};
const find_Direct_Reff_Transactions = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const findTransaction = await Profile.findAll({
    where: {
      refferal: user_info.id
    },
    attributes: ['refferal', 'pkg', 'user_id', 'createdAt'],
    include: { model: User, as: 'find_Direct_Reff_Transactions' }
  })
  res.json(findTransaction)
}
const decode = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.body.username },
    });
    const userDecode = await jwt_decode(user.password);
    res.json(userDecode);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  ADMIN,
  Register,
  Login,
  testTrend,
  find_Direct_Reff_Transactions,
  userDetail,
  showusers,
  Upgrades,
  placementInvest,
  verifyCode,
  verifyEmail,
  Get_userProfile,
  isActivate,
  Pakage_info,
  profileInfo,
  update_profile,
  refferals,
  FindRefferal,
  Withdraw,
  ResetPassword,
  Placements,
  ShowReff,
  getUserByTrend,
  wallets,
  FIndUserDetail,
  FindUserPakage,
  findTransac,
  decode,
  Upgrade_Snippet
};
