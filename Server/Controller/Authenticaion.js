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

    await User_Profile.create({
      user_id: 1
    })
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

const FindUsers = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const { pkg } = req.body
  //placement start
  let placements = [];
  let Placement_Upgrade = []
  let placement_check
  const Selected = await Profile.findOne({
    where: { user_id: user_info.id, pkg: pkg },
    include: { model: Upgrade },

  });

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

  if (Selected.pkg == pkg) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    placement_check = Placement_Upgrade.filter((placement) => placement?.Upgrade?.level >= Selected?.Upgrade?.level);
  }
  const FIndUser = await User.findOne({
    where: { id: user_info.id },
    include: { model: Profile }
  })
  const Only_admin = await User.findOne(
    {
      where: { id: 1 },
      include: { model: User_Profile }
    }
  )

  let Find_placement

  Find_placement = await User.findOne(
    {
      where: { id: placement_check?.length > 0 ? placement_check[0]?.user_id : Only_admin?.id },
      include: { model: User_Profile }
    }
  )
  const Find_Reff = await User.findOne(
    {
      where: { id: FIndUser.Profile.refferal },
      include: { model: User_Profile }
    }
  )
  res.json({
    placement: Find_placement.User_profile?.wallet_address,
    Direct_reff: Find_Reff.User_profile?.wallet_address
  })
}
const FindUsers_Purchase = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const { pkg } = req.body
  //placement start
  let placements = [];
  let Placement_Upgrade = []
  let placement_check
  const Selected = await Profile.findOne({
    where: { user_id: user_info.id, pkg: pkg },
    include: { model: Upgrade },

  });
  const FIndUser = await User.findOne({
    where: { id: user_info.id },
    include: { model: Profile }
  })

  let placement, find_placement, Direct_reff

  placement = await Profile.findOne(
    {
      where: {
        [Sequelize.Op.or]: [
          { left: Selected.user_id, pkg: pkg },
          { right: Selected.user_id, pkg: pkg },
        ],
      }
    }
  );

  find_placement = await User.findOne({
    where: { id: placement.user_id },
    include: { model: User_Profile }
  })
  Direct_reff = await User.findOne({
    where: { id: FIndUser.Profile.refferal },
    include: { model: User_Profile }
  })

  res.json({ placement: find_placement.User_profile.wallet_address, Direct_reff: Direct_reff.User_profile.wallet_address })

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

    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0: No_placement_CUTT_TO_ALL(
          1,
          126,
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
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
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgraded successfully!');
    } //Upgrades4
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          126,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          281.250,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )

          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          632.813,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          1423.828,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          3203.613,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          7208.130,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          16218.292,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          36491.158,
          user_info.id,
          Upgrades4,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
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

    if (placement_check.length === 0) {
      switch (Selected.Upgrade.level) {
        case 0: No_placement_CUTT_TO_ALL(
          1,
          12.5,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
          2,
          28.125,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
          3,
          63.281,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
          4,
          142.383,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
          5,
          320.361,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
          6,
          720.813,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
          7,
          1621.829,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
          8,
          3649.116,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          12.5,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          28.125,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          63.281,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          142.383,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          320.361,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          720.813,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
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
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          1621.829,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          3649.116,
          user_info.id,
          Upgrades1,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
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
        case 0: No_placement_CUTT_TO_ALL(
          1,
          25,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
          2,
          56.250,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
          3,
          126.563,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
          4,
          284.766,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
          5,
          640.723,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
          6,
          1441.626,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
          7,
          3243.658,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
          8,
          7298.232,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          25,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          56.250,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          126.563,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          284.766,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          640.723,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          1441.626,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          3243.658,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          7298.232,
          user_info.id,
          Upgrades2,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
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
        case 0: No_placement_CUTT_TO_ALL(
          1,
          62.5,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
          2,
          140.625,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
          3,
          316.406,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
          4,
          711.914,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
          5,
          1601.807,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
          6,
          3604.065,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
          7,
          8109.146,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
          8,
          18245.579,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          62.5,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          140.625,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          316.406,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          711.914,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          1601.807,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          3604.065,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          8109.146,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          18245.579,
          user_info.id,
          Upgrades3,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
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
        case 0: No_placement_CUTT_TO_ALL(
          1,
          250,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
          2,
          562.5,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
          3,
          1265.625,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
          4,
          2847.656,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
          5,
          6407.227,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
          6,
          14416.260,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
          7,
          32436.584,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
          8,
          72982.315,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          250,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          562.5,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          1265.625,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          2847.565,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          6407.227,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          14416.260,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          32436.584,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          72982.315,
          user_info.id,
          Upgrades5,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
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
        case 0: No_placement_CUTT_TO_ALL(
          1,
          438,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 1: No_placement_CUTT_TO_ALL(
          2,
          984.4,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 2: No_placement_CUTT_TO_ALL(
          3,
          2214.844,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 3: No_placement_CUTT_TO_ALL(
          4,
          4983.398,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 4: No_placement_CUTT_TO_ALL(
          5,
          11212.646,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 5: No_placement_CUTT_TO_ALL(
          6,
          25228.455,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 6: No_placement_CUTT_TO_ALL(
          7,
          56764.023,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        case 7: No_placement_CUTT_TO_ALL(
          8,
          127719.051,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom,
          Reff_pkg,
          Placementforadminfrom
        )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Updated successfully!');
    }
    else {
      switch (Selected.Upgrade.level) {
        case 0: GotPlacement_CUTT_TO_ALL(
          1,
          438,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 1: GotPlacement_CUTT_TO_ALL(
          2,
          984.4,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 2: GotPlacement_CUTT_TO_ALL(
          3,
          2214.844,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 3: GotPlacement_CUTT_TO_ALL(
          4,
          4983.398,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 4: GotPlacement_CUTT_TO_ALL(
          5,
          11212.646,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 5: GotPlacement_CUTT_TO_ALL(
          6,
          25228.455,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 6: GotPlacement_CUTT_TO_ALL(
          7,
          56764.023,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
          transactionUpgradeToAdmin,
          transactionFromReff,
          AllTaxAdmin,
          Upgrade_pkg,
          Taxforadminfrom
        )
          break
        case 7: GotPlacement_CUTT_TO_ALL(
          8,
          127719.051,
          user_info.id,
          Upgrades6,
          findReff,
          find_admin,
          find_income,
          adminWallet,
          placement_check,
          placement_pay,
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
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }
};

const No_placement_CUTT_TO_ALL = async (
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
  Taxforadminfrom,
  Reff_pkg,
  Placementforadminfrom
) => {

  let IF_ONLY_ADMIN_CUTT_transaction, IF_ONLY_ADMIN_REFF_CUTT_transaction, IF_ONLY_ADMIN_Direct, IF_ONLY_ADMIN_placement

  IF_ONLY_ADMIN_Direct = Upgrade_Price * 0.20
  IF_ONLY_ADMIN_placement = Upgrade_Price * 0.80

  IF_ONLY_ADMIN_CUTT_transaction = Upgrade_Price * 0.80
  IF_ONLY_ADMIN_REFF_CUTT_transaction = Upgrade_Price * 0.25


  //upgrade levels
  await Upgrade.update({
    level,
    upgrade: Upgrade_Price
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
      payment: findReff.wallet.payment + IF_ONLY_ADMIN_Direct
    }
    ,
    {
      where: {
        user_id: findReff.id
      }
    })
  // payment in 
  await TotalIncome.update(
    { income: find_income.income + IF_ONLY_ADMIN_Direct },
    { where: { user_id: findReff.id } }
  );
  //payment refferal transaction
  await Transaction.create(
    {
      from: user_id,
      to: findReff.id,
      reason: Reff_pkg,
      payment: IF_ONLY_ADMIN_REFF_CUTT_transaction,
      user_id: user_id
    })
  // admin wallet
  await wallet.update(
    {
      payment: adminWallet.wallet.payment + IF_ONLY_ADMIN_placement
    }
    ,
    {
      where: {
        user_id: 1
      }
    })
  //admin total income
  await TotalIncome.update(
    { income: find_admin.income + IF_ONLY_ADMIN_placement },
    { where: { user_id: 1 } }
  );

  // admin wallet transaction
  await Transaction.create(
    {
      from: user_id,
      to: 1,
      reason: Taxforadminfrom,
      payment: IF_ONLY_ADMIN_placement,
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
const GotPlacement_CUTT_TO_ALL = async (
  level,
  Upgrade_Price,
  user_id,
  pkg_price,
  findReff,
  find_admin,
  find_income,
  adminWallet,

  placement_check,
  placement_pay,

  transactionUpgradeToAdmin,
  transactionFromReff,
  AllTaxAdmin,
  Upgrade_pkg,
  Taxforadminfrom
) => {

  let IF_ONLY_ADMIN_CUTT, IF_ONLY_ADMIN_REFF_CUTT, IF_ONLY_ADMIN_Direct, IF_ONLY_ADMIN_placement, IF_ONLY_ADMIN

  IF_ONLY_ADMIN = Upgrade_Price * 0.10
  IF_ONLY_ADMIN_Direct = Upgrade_Price * 0.20
  IF_ONLY_ADMIN_placement = Upgrade_Price * 0.70

  IF_ONLY_ADMIN_Direct_Transaction = Upgrade_Price * 0.25
  IF_ONLY_ADMIN_placement_Transaction = Upgrade_Price * 0.75

  IF_ONLY_ADMIN_CUTT = Upgrade_Price * 0.80
  IF_ONLY_ADMIN_REFF_CUTT = Upgrade_Price * 0.20


  //upgrade levels
  await Upgrade.update({
    level,
    upgrade: Upgrade_Price
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
      user_id
    })
  //payment to referal
  await wallet.update(
    {
      payment: findReff.wallet.payment + IF_ONLY_ADMIN_Direct
    }
    ,
    {
      where: {
        user_id: findReff.id
      }
    })
  // payment in 
  await TotalIncome.update(
    { income: find_income.income + IF_ONLY_ADMIN_Direct },
    { where: { user_id: findReff.id } }
  );
  //payment refferal transaction
  await Transaction.create(
    {
      from: user_id,
      to: findReff.id,
      reason: Upgrade_pkg,
      payment: IF_ONLY_ADMIN_Direct_Transaction,
      user_id
    })
  // placement wallet
  await wallet.update(
    {
      payment: placement_check[0].wallet.payment + IF_ONLY_ADMIN_placement
    }
    ,
    {
      where: {
        user_id: placement_check[0].user_id
      }
    })
  // placement wala
  await TotalIncome.update(
    { income: find_income.income + IF_ONLY_ADMIN_placement },
    { where: { user_id: placement_check[0].user_id } }
  );

  // placement transaction
  await Transaction.create(
    {
      from: user_id,
      to: placement_check[0].user_id,
      reason: placement_pay,
      payment: IF_ONLY_ADMIN_placement_Transaction,
      user_id
    })
  // admin wallet
  await wallet.update(
    {
      payment: adminWallet.wallet.payment + IF_ONLY_ADMIN
    }
    ,
    {
      where: {
        user_id: 1
      }
    })
  //admin total income
  await TotalIncome.update(
    { income: find_admin.income + IF_ONLY_ADMIN },
    { where: { user_id: 1 } }
  );

  // admin wallet transaction
  await Transaction.create(
    {
      from: user_id,
      to: 1,
      reason: Taxforadminfrom,
      payment: IF_ONLY_ADMIN,
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
        NextPackage = 62.5;
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
        NextPackage = 8109.146;
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
        NextPackage = 126;
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
        NextPackage = 562.5;
        break;
      case (findUpdate.level == 2):
        NextPackage = 1265.625;
        break;
      case (findUpdate.level == 3):
        NextPackage = 2847.656;
        break;
      case (findUpdate.level == 4):
        NextPackage = 6407.227;
        break;
      case (findUpdate.level == 5):
        NextPackage = 14416.260;
        break;
      case (findUpdate.level == 6):
        NextPackage = 32436.584;
        break;
      case (findUpdate.level == 7):
        NextPackage = 72982.315;
        break;
      default:
        NextPackage = 250;
        break;
    }
  } else if (findUpdate.pkg_price == 350) {
    switch (true) {
      case (findUpdate.level == 0):
        NextPackage = 438;
        break;
      case (findUpdate.level == 1):
        NextPackage = 984.4;
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
        NextPackage = 438;
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
      user: 'smartxblockchain@gmail.com',
      pass: 'xjrqdjwrmyguurqp',
    },
  });
  // Define the email content
  const mailOptions = {
    from: '"smartxblockchain" <smartxblockchain@gmail.com>',
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
  Upgrade_Snippet,
  FindUsers,
  FindUsers_Purchase
};
