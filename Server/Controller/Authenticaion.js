const db = require("../models");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { Sequelize } = require("sequelize");
const { sequelize } = require("../models");

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
    res.json("User Registered Successfully");
  } else {
    res.json("User Found please try another username");
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
  const Selected = await Profile.findOne({
    where: { user_id: user_info.id, pkg: pkg },
    include: { model: Upgrade }
  });

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
  let Placement_check

  let placement = await Profile.findOne(
    {
      where: {
        [Sequelize.Op.or]: [
          { left: Selected.user_id, pkg: pakage_prices4 },
          { right: Selected.user_id, pkg: pakage_prices4 },
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
          { left: placement.user_id, pkg: pakage_prices4 },
          { right: placement.user_id, pkg: pakage_prices4 },
        ],
      },
      include: [
        { model: Pakage, attributes: ["pkg_name", "pkg_price"] },
        { model: Upgrade },
        { model: wallet },
      ],
    });
    if (placement) {
      placements.push(placement);
    }
  }



};

const purchase_PKG = async (pkg, user_info, pkg_name, res) => {

  const findRight = await Profile.findOne({
    where: {
      left: { [Sequelize.Op.ne]: null },
      right: null,
      pkg: pkg,
    },
  });
  let ReffkWallets1

  ReffkWallets1 = await Refferal.findOne({
    where: { user_id: user_info.id },
    include: {
      model: User,
      as: 'directReffUser',
      include: {
        model: wallet,
        as: 'reff',
      },
    },
  });
  const percentage10 = (pkg * 10) / 100;
  const percentage45 = (pkg * 45) / 100;
  const percentage90 = (pkg * 90) / 100;

  if (findRight) {
    // xx-------------------xx------------------------------xx---------------------xxx
    const Reff = await Refferal.findOne({
      where: { user_id: user_info.id },
      include: {
        model: User,
        as: 'directReffUser',
        include: {
          model: wallet,
          as: 'reff',
        },
      },
    });
    const usermake = await Profile.create({
      refferal: Reff.directReffUser.id,
      pkg: pkg,
      user_id: user_info.id,
    });

    await Profile.update(
      {
        right: user_info.id,
      },
      {
        where: {
          id: findRight.id,
        },
      }
    );
    await Upgrade.Update({
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

    await Pakage.create({
      user_id: user_info.id,
      pkg_price: pkg,
      pkg_name: pkg_name,
    });

    const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });

    const placementWallet = await wallet.findOne({
      where: { user_id: findRight.user_id },
    })

    if (Reff.directReffUser.id == 1) {
      await wallet.update(
        { payment: adminkWallets1.payment + pkg },
        { where: { user_id: adminkWallets1.user_id } }
      );
      await Transaction.create({
        from: user_info.id,
        to: 1,
        reason: "commision with tax for admin",
        payment: pkg,
        user_id: 1,
      });
    } else {

      await wallet.update(
        { payment: adminkWallets1.payment + percentage10 },
        { where: { user_id: adminkWallets1.user_id } }
      ); // 10% for admin
      await wallet.update(
        { payment: Reff.directReffUser.reff.payment + percentage45 },
        { where: { user_id: ReffkWallets1.user_id } }
      ); // 45% for direct refferal
      await wallet.update(
        { payment: placementWallet.payment + percentage45 },
        { where: { user_id: findRight.user_id } }
      ); // 45% for placement

      await Transaction.create({
        from: user_info.id,
        to: 1,
        reason: "tax for admin",
        payment: percentage10,
        user_id: 1,
      });

      await Transaction.create({
        from: "meta mask",
        to: user_info.id,
        reason: "you purchased pakage",
        payment: percentage90,
        user_id: user_info.id,
      });
    }
    // await wallet.create({
    //   payment: 0,
    //   user_id: user_info.id,
    // });
    res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

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
        include: {
          model: User,
          as: 'directReffUser',
          include: {
            model: wallet,
            as: 'reff',
          },
        },
      });
      const usermake = await Profile.create({
        refferal: Reff.directReffUser.id,
        pkg: pkg,
        user_id: user_info.id,
      });

      await Profile.update(
        {
          left: user_info.id,
        },
        {
          where: {
            id: findLeft.id,
          },
        }
      );
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

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pkg,
        pkg_name: pkg_name,
      });
      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });

      const placementWallet = await wallet.findOne({
        where: { user_id: findLeft.user_id },
      })

      if (Reff.directReffUser.id == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pkg },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision and tax for admin",
          payment: pkg,
          user_id: 1,
        })
      } else {
        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: Reff.directReffUser.reff.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findLeft.user_id } }
        ); // 45% for placement

        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: percentage10,
          user_id: 1,
        });

        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: percentage90,
          user_id: user_info.id,
        });
      }

      res.json({ msg: `from Left of ${pkg}`, findLeft });
      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const Reff = await Refferal.findOne({
        where: { user_id: user_info.id },
        include: {
          model: User,
          as: 'directReffUser',
          include: {
            model: wallet,
            as: 'reff',
          },
        },
      });
      const usermake = await Profile.create({
        refferal: Reff.directReffUser.id,
        pkg: pkg,
        user_id: user_info.id,
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

      const percentage55 = (pkg * 55) / 100;
      const percentage45 = (pkg * 45) / 100;

      if (Reff.directReffUser.id == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pkg },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pkg,
          user_id: 1,
        });
        // res.status(200).json({ msg: "done" });
      } else {
        await wallet.update(
          { payment: adminkWallets1.payment + percentage55 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: Reff.directReffUser.reff.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 90% for user
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: percentage55,
          user_id: 1,
        });

        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: percentage45,
          user_id: user_info.id,
        });
      }

      res.status(200).json({ msg: "no space found", usermake });
    }
  }

}

const placementInvest = async (req, res) => {
  const { pkg, pkg_name } = req.body;

  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);

  if (pkg == pakage_prices1) {
    purchase_PKG(pakage_prices1, user_info, pkg_name, res)
  } else if (pkg == pakage_prices2) {
    purchase_PKG(pakage_prices2, user_info, pkg_name, res)
  } else if (pkg == pakage_prices3) {
    purchase_PKG(pakage_prices3, user_info, pkg_name, res)
  } else if (pkg == pakage_prices4) {
    purchase_PKG(pakage_prices4, user_info, pkg_name, res)
  } else if (pkg == pakage_prices5) {
    purchase_PKG(pakage_prices5, user_info, pkg_name, res)
  } else if (pkg == pakage_prices6) {
    purchase_PKG(pakage_prices6, user_info, pkg_name, res)
  }
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
// ----------------- TREND START
const ShowReff = async (req, res) => {
  const userfind = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userfind);

  const user = await Profile.findOne({
    where: { user_id: user_info.id },
    // attributes: ["username", "left", "right"],
    include: [
      {
        model: Refferal,
        as: "left_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
      },
      {
        model: Refferal,
        as: "right_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
      },
    ],
  });
  res.status(200).json(user);
};
const getUserByTrend = async (req, res) => {
  const UserID = req.params.userId;

  const user = await Profile.findByPk(UserID, {
    include: [
      {
        model: Refferal,
        as: "left_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
      },
      {
        model: Refferal,
        as: "right_placement",
        attributes: ["refferal", "user_id", "level_id", "placement_id"],
      },
    ],
  });
  res.status(200).json(user);
};
// -----------------TREND END
const wallets = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  // const Walletx = await Profile.findOne({
  //   where: { id: user_info.id },
  // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
  //   include: [{
  //     model: wallet,
  //     attributes: ['payment']
  //   }]
  // })
  const Walletx = await wallet.findOne({ where: { user_id: user_info.id } });
  res.json(Walletx);
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

  res.status(200).send({ packages, pkg_check });
};

const findTransac = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  const transaction = await Transaction.findAll({
    where: { user_id: user_info.id },
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
    include:{model:User,as:'User'}
  })
  res.json(findTransaction)
}
const decode = async (req, res) => {
  try {
    const user = await Profile.findOne({
      where: { username: req.body.username },
    });
    const userDecode = await jwt_decode(user.password);
    res.json({ user: userDecode });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  ADMIN,
  Register,
  Login,
  // makeProfile,
  find_Direct_Reff_Transactions,
  userDetail,
  showusers,
  Upgrades,
  placementInvest,
  Pakage_info,
  refferals,
  Placements,
  ShowReff,
  getUserByTrend,
  wallets,
  FIndUserDetail,
  FindUserPakage,
  findTransac,
  decode,
};
