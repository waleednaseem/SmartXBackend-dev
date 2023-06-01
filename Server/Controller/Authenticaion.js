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
  const password = req.body.password;
  const hashedPassword = jwt.sign({ password }, "teriMaaKiChot");
  const USER = await User.findOne({ where: { username: req.body.username } });

  if (!USER) {
    await User.create({
      username: req.body.username,
      password: hashedPassword,
    });
    res.json("User Registered Successfully");
  } else {
    res.json("User Found please try another username");
  }
};

const Login = async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.body.username,
    },
  });

  if (!user) {
    return res.status(200).send("User not found");
  }
  const payload = {
    id: user.id,
  };
  // const validPassword = await bcrypt.compare(req.body.password, user.password)
  const token = jwt.sign(payload, "teriMaaKiChot");

  if (!token) {
    return res.status(401).send("Invalid password");
  }

  try {
    res.status(200).send({ message: "Logged in successfully", token });
  } catch (err) {
    res.status(500).send({ message: "Error creating token" });
  }
};

const makeProfile = async (req, res) => {
  const password = req.body.password;
  const hashedPassword = jwt.sign({ password }, "teriMaaKiChot");
  const userfind = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userfind);

  const admin = await Profile.findOne({ where: { id: 1 } });

  if (!admin) {
    // Create the admin user if it doesn't exist
    await Profile.create({
      refferal: 0,
      user_id: 1,
    });

    // Create a wallet for the admin user
    const adminWallet = await wallet.create({
      payment: 0,
      user_id: 1,
    });

    // Update the wallet based on the package price
    switch (req.body.pkg_price) {
      case 3000:
        await wallet.update(
          { payment: adminWallet.payment + 300 },
          { where: { user_id: 1 } }
        );
        break;
      case 5000:
        await wallet.update(
          { payment: adminWallet.payment + 500 },
          { where: { user_id: 1 } }
        );
        break;
      case 10000:
        await wallet.update(
          { payment: adminWallet.payment + 1000 },
          { where: { user_id: 1 } }
        );
        break;
      default:
        break;
    }
  }

  const { pkg, from_user_payment, to_user_payment } = req.body;
  // const refferalwalletpayment = await wallet.findOne({ where: { user_id: req.body.refferal } })

  if (pkg == pakage_prices1) {
    const findRight100 = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices1,
      },
    });

    if (findRight100) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        // level: findRight100.level + 1,
        pkg: pakage_prices1,
        user_id: user_info.id,
      });

      await Profile.update(
        {
          right: user_info.id,
        },
        {
          where: {
            id: findRight100.id,
          },
        }
      );
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        // level_id: usermake.level,
        placement_id: findRight100.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: req.body.pkg_price,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + 3000 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: 3000,
          user_id: 1,
        });
      } else {
        await wallet.update(
          { payment: adminkWallets1.payment + 300 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + 2700 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 90% for user
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: 300,
          user_id: 1,
        });

        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: 2700,
          user_id: user_info.id,
        });
      }
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: "from Right of 3000", findRight100 });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft3000 = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices1,
        },
      });
      if (findLeft3000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          // level: findLeft3000.level + 1,
          pkg: pakage_prices1,
          user_id: user_info.id,
        });

        await Profile.update(
          {
            left: user_info.id,
          },
          {
            where: {
              id: findLeft3000.id,
            },
          }
        );
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          // level_id: usermake.level,
          placement_id: findLeft3000.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 3000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: 3000,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 300 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 2700 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "tax for admin",
            payment: 300,
            user_id: 1,
          });

          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: 2700,
            user_id: user_info.id,
          });
        }
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: "from Left of 3000", findLeft3000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices1,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft3000.id?findLeft3000.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 3000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: 3000,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 300 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 2700 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "tax for admin",
            payment: 300,
            user_id: 1,
          });

          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: 2700,
            user_id: user_info.id,
          });
        }

        res.status(200).json({ msg: "no space found", usermake });
      }
    }
  } else if (pkg == pakage_prices2) {
    const findRight5000 = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices2,
      },
    });

    if (findRight5000) {
      // xx-------------------xx------------------------------xx---------------------xxx
      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        // level: findRight5000.level + 1,
        pkg: pakage_prices2,
        user_id: user_info.id,
      });

      await Profile.update(
        {
          right: user_info.id,
        },
        {
          where: {
            id: findRight5000.id,
          },
        }
      );
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });
      await Refferal.create({
        // level_id: usermake.level,
        placement_id: findRight5000.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: req.body.pkg_price,
        pkg_name: req.body.pkg_name,
      });
      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + 5000 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "commision and tax for admin",
          payment: 5000,
          user_id: user_info.id,
        });
      } else {
        await wallet.update(
          { payment: adminkWallets1.payment + 500 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + 4500 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 90% for user
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: 500,
          user_id: 1,
        });

        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: 4500,
          user_id: user_info.id,
        });
      }

      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: "from Right of 5000", findRight5000 });
      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft5000 = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices2,
        },
      });
      if (findLeft5000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          // level: findLeft5000.level + 1,
          pkg: pakage_prices2,
          user_id: user_info.id,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Profile.update(
          {
            left: user_info.id,
          },
          {
            where: {
              id: findLeft5000.id,
            },
          }
        );
        await Refferal.create({
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });
        // const pkg = await Pakage.findOne({ where: { user_id: req.body.refferal } })

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 5000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 500 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 4500 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
        }

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.status(200).json({ msg: "from Left of 5000", findLeft5000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices2,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: 500,
          user_id: 1,
        });
        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "Purchased Pakage",
          payment: 4500,
          user_id: 1,
        });
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        await Refferal.create({
          // placement_id: findLeft3000.id?findLeft3000.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 5000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 500 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 4500 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
        }
        // await wallet.update({ payment: adminkWallets1.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
        // await wallet.update({ payment: ReffkWallets1.payment + 4500 }, { where: { user_id: ReffkWallets1.user_id } }) // 90% for user
        res.status(200).json({ msg: "no space found", usermake });
      }
    }
  } else if (pkg == pakage_prices3) {
    const findRight10000 = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices3,
      },
    });

    if (findRight10000) {
      // xx-------------------xx------------------------------xx---------------------xxx
      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        // level: findRight10000.level + 1,
        pkg: pakage_prices3,
        user_id: user_info.id,
      });

      await Profile.update(
        {
          right: user_info.id,
        },
        {
          where: {
            id: findRight10000.id,
          },
        }
      );
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });
      await Refferal.create({
        // level_id: usermake.level,
        placement_id: findRight10000.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: req.body.pkg_price,
        pkg_name: req.body.pkg_name,
      });
      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + 10000 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "commision and tax for admin",
          payment: 10000,
          user_id: user_info.id,
        });
      } else {
        await wallet.update(
          { payment: adminkWallets1.payment + 1000 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + 9000 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 90% for user
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "tax for admin",
          payment: 1000,
          user_id: 1,
        });

        await Transaction.create({
          from: "meta mask",
          to: user_info.id,
          reason: "you purchased pakage",
          payment: 9000,
          user_id: user_info.id,
        });
      }

      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: "from Right of 10000", findRight10000 });
      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft10000 = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices3,
        },
      });
      if (findLeft10000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          // level: findLeft10000.level + 1,
          pkg: pakage_prices3,
          user_id: user_info.id,
        });

        await Profile.update(
          {
            left: user_info.id,
          },
          {
            where: {
              id: findLeft10000.id,
            },
          }
        );
        await Refferal.create({
          // level_id: usermake.level,
          placement_id: findLeft10000.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });
        // const pkg = await Pakage.findOne({ where: { user_id: req.body.refferal } })

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 10000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "commision and tax for admin",
            payment: 10000,
            user_id: user_info.id,
          });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 1000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 9000 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "tax for admin",
            payment: 1000,
            user_id: 1,
          });

          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: 9000,
            user_id: user_info.id,
          });
        }

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.status(200).json({ msg: "from Left of 10000", findLeft10000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices3,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        await Refferal.create({
          refferal: req.body.refferal,
          user_id: user_info.id,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + 10000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "commision and tax for admin",
            payment: 10000,
            user_id: user_info.id,
          });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + 1000 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + 9000 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "tax for admin",
            payment: 1000,
            user_id: 1,
          });

          await Transaction.create({
            from: "meta mask",
            to: user_info.id,
            reason: "you purchased pakage",
            payment: 9000,
            user_id: user_info.id,
          });
        }
        res.status(200).json({ msg: "no space found", usermake });
      }
    }
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

  // countLevels(user, 1);
  // res.json({ CountLevel: CountLevel });

  // res
  //   .status(200)
  //   .send([
  //     { first: user.left_placement.user_id },
  //     { second: user.left_placement.ReffUsers.left_placement.user_id },
  //     {
  //       third:
  //         user.left_placement.ReffUsers.left_placement.ReffUsers.left_placement
  //           .user_id,
  //     },
  //     {
  //       forth:
  //         user.left_placement.ReffUsers.left_placement.ReffUsers.left_placement
  //           .ReffUsers.left_placement.user_id,
  //     },
  //     // {
  //     //   fifth:
  //     //     user.left_placement.ReffUsers.left_placement.ReffUsers.left_placement
  //     //       .ReffUsers.left_placement.ReffUsers.left_placement.user_id,
  //     // },
  //   ]);
};

const Upgrades = async (req, res) => {
  const { levels, refferal } = req.body;

  const Upgrades1 = 10;
  const Upgrades2 = 20;
  const Upgrades3 = 50;
  const Upgrades4 = 100;
  const Upgrades5 = 200;
  const Upgrades6 = 350;

  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);
  const Selected = await Profile.findOne({
    where: { user_id: user_info.id },
    include: { model: Upgrade }
  });
  const finfReff = await Profile.findOne({
    where: { user_id: refferal },
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
    // if (placement) {
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
  // res.json(adminWallet.wallet.payment )
  // return false
  if (Selected.pkg == Upgrades4) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 125,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 25
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Upgraded package",
              payment: 31.250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 87.5
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 93.750,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12.50
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 12.50,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
          //upgrade levels
          await Upgrade.update({
            level: 2,
            upgrade: 281.250
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 281.250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 56.250
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 70.313,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 196.875
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 210.938,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 28.125
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 28.125,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 2:
             //upgrade levels
             await Upgrade.update({
              level: 3,
              upgrade: 632.813
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 632.813,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 126.563
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 158.203,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 442.969
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 474.609,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 63.281
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 63.281,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 1423.828
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 1423.828,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 284.766
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 355.957,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 996.680
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 1067.871,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 142.383
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 142.383,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 3203.613
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 3203.613,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 640.723
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 800.903,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 2242.529
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 2402.710,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 320.361
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 320.361,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 7208.130
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 7208.130,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 1441.626
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 1802.032,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 5045.691
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 5406.097,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 720.813
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 720.813,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 16218.292
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 16218.292,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 3243.658
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 4054.573,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 11352.805
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 12163.719,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1621.829
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 1621.829,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 36491.158
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 36491.158,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 7298.232
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 9122.789,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 25549.810
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 27368.368,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 3649.116
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 3649.116,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }else if (Selected.pkg == Upgrades1) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 12.5,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 2.5
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 3.125,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment +8.75
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 9.375,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1.250
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 1.250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
        //upgrade levels
        await Upgrade.update({
          level: 2,
          upgrade: 28.125
        }, {
          where:
          {
            user_id: user_info.id
          }
        }
        )
        //upgrade levels transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: "Upgraded package",
            payment: 28.125,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        //payment to referal
        await wallet.update(
          {
            payment: finfReff.wallet.payment + 12.656
          }
          ,
          {
            where: {
              user_id: finfReff.id
            }
          })
        //payment refferal transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: finfReff.id,
            reason: "Referal",
            payment: 15.820,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // placement wallet
        await wallet.update(
          {
            payment: Placement_check[0].wallet.payment +44.297
          }
          ,
          {
            where: {
              user_id: Placement_check[0].id
            }
          })
        // placement transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: Placement_check[0].id,
            reason: "placement payment",
            payment: 47.461,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // admin wallet
        await wallet.update(
          {
            payment: adminWallet.wallet.payment + 6.382
          }
          ,
          {
            where: {
              user_id: user_info.id
            }
          })
        // admin wallet transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: " Tax for admin",
            payment: 6.382,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
          break
        case 2:
            //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 63.281
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 63.281,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 12.656
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 15.820,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 44.297
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 47.461,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.328
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 6.328,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 142.383
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 142.383,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 82.47
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 35.596,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 99.668
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 106.787,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 41.238
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 41.238,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 320.361
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 320.361,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 64.072
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 80.090,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 224.253
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 240.271,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 32.036
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 32.036,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 720.813
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 720.813,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 144.163
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 180.203,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 504.569
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 540.610,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 72.081
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 72.081,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 1621.029
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 1621.029,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 324.366
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 405.457,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 1135.280
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 1216.372,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 162.183
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 162.183,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 3649.116
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 3649.116,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 729.823
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 912.279,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 2554.381
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 2736.837,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 364.912
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 364.912,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }else if (Selected.pkg == Upgrades2) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 25,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 5.0
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 6.250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 17.500
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 18.750,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2.500
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 2.500,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
        //upgrade levels
        await Upgrade.update({
          level: 2,
          upgrade: 56.250
        }, {
          where:
          {
            user_id: user_info.id
          }
        }
        )
        //upgrade levels transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: "Upgraded package",
            payment: 56.250,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        //payment to referal
        await wallet.update(
          {
            payment: finfReff.wallet.payment + 11.250
          }
          ,
          {
            where: {
              user_id: finfReff.id
            }
          })
        //payment refferal transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: finfReff.id,
            reason: "Referal",
            payment: 14.063,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // placement wallet
        await wallet.update(
          {
            payment: Placement_check[0].wallet.payment + 39.375
          }
          ,
          {
            where: {
              user_id: Placement_check[0].id
            }
          })
        // placement transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: Placement_check[0].id,
            reason: "placement payment",
            payment: 42.188,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // admin wallet
        await wallet.update(
          {
            payment: adminWallet.wallet.payment + 5.625
          }
          ,
          {
            where: {
              user_id: user_info.id
            }
          })
        // admin wallet transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: " Tax for admin",
            payment: 5.625,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
          break
        case 2:
            //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 126.563
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 126.563,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 25.313
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 31.641,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 88.594
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 94.922,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12.656
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 12.656,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 284.766
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 284.766,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 56.953
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 71.191,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 199.336
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 213.574,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 28.477
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 28.477,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 640.723
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 640.723,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 128.145
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 160.181,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 448.506
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 480.542,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 64.072
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 64.072,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 1441.626
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 1441.626,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 288.325
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 360.406,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 1009.138
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 1081.219,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 144.163
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 144.163,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 3243.658
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 3243.658,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 648.732
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 810.915,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 2270.561
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 2432.744,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 324.366
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 324.366,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 7298.232
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 7298.232,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 1459.646
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 1824.558,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 5108.762
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 5473.674,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 729.823
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 729.823,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }else if (Selected.pkg == Upgrades3) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 62.500,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 12.500
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 15.625,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 43.750
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 46.875,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 6.250
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 6.250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
        //upgrade levels
        await Upgrade.update({
          level: 2,
          upgrade: 140.625
        }, {
          where:
          {
            user_id: user_info.id
          }
        }
        )
        //upgrade levels transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: "Upgraded package",
            payment: 140.625,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        //payment to referal
        await wallet.update(
          {
            payment: finfReff.wallet.payment + 28.125
          }
          ,
          {
            where: {
              user_id: finfReff.id
            }
          })
        //payment refferal transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: finfReff.id,
            reason: "Referal",
            payment: 35.156,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // placement wallet
        await wallet.update(
          {
            payment: Placement_check[0].wallet.payment + 98.438
          }
          ,
          {
            where: {
              user_id: Placement_check[0].id
            }
          })
        // placement transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: Placement_check[0].id,
            reason: "placement payment",
            payment: 105.469,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // admin wallet
        await wallet.update(
          {
            payment: adminWallet.wallet.payment + 14.063
          }
          ,
          {
            where: {
              user_id: user_info.id
            }
          })
        // admin wallet transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: " Tax for admin",
            payment: 14.063,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
          break
        case 2:
            //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 316.406
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 316.406,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 63.281
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 79.105,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 22.484
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 237.305,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 31.641
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 31.641,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 711.914
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 711.914,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 142.383
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 177.979,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 498.940
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 533.936,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 71.191
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 71.191,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 1601.807
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 1601.807,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 320.361
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 400.452,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 1121.265
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 1201.355,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 160.181
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 160.181,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 3604.065
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 3604.065,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 7205.813
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 901.016,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 2522.845
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 2703.049,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 360.406
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 360.406,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 8109.065
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 8109.065,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 5676.402
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 2027.287,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 11352.80
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 6081.860,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 810.915
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 810.915,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 18245.579
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 18245.579,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 3649.116
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 4561.395,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 12771.905
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 13684.184,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1824.558
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 1824.558,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }else if (Selected.pkg == Upgrades5) {
    for (let i = 1; i < placements.length; i += 2) {
      Placement_Upgrade.push(placements[i]);
    }
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 250,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 50
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 62.500,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 175.00
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 187.500,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 25.00
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 25.00,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
        //upgrade levels
        await Upgrade.update({
          level: 2,
          upgrade: 281.250
        }, {
          where:
          {
            user_id: user_info.id
          }
        }
        )
        //upgrade levels transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: "Upgraded package",
            payment: 281.250,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        //payment to referal
        await wallet.update(
          {
            payment: finfReff.wallet.payment + 112.500
          }
          ,
          {
            where: {
              user_id: finfReff.id
            }
          })
        //payment refferal transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: finfReff.id,
            reason: "Referal",
            payment: 140.625,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // placement wallet
        await wallet.update(
          {
            payment: Placement_check[0].wallet.payment + 393.750
          }
          ,
          {
            where: {
              user_id: Placement_check[0].id
            }
          })
        // placement transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: Placement_check[0].id,
            reason: "placement payment",
            payment: 421.875,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // admin wallet
        await wallet.update(
          {
            payment: adminWallet.wallet.payment + 56.250
          }
          ,
          {
            where: {
              user_id: user_info.id
            }
          })
        // admin wallet transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: " Tax for admin",
            payment: 56.250,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
          break
        case 2:
            //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 632.813
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 632.813,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 253.125
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 361.409,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 885.338
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 949.219,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 126.563
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 126.563,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 1423.828
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 1423.828,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 569.531
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 711.914,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 1993.359
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 2135.742,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 284.766
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 284.766,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 3203.613
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 3203.613,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 1281.445
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 1601.807,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 4485.059
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 4805.420,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 640.723
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 640.723,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 7208.130
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 7208.130,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 2883.252
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 3604.065,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 10091.382
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 10812.195,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1441.626
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 1441.626,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 16218.292
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 16218.292,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 6487.317
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 8109.146,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 22705.609
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 24327.438,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 3243.658
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 3243.658,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 36491.158
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 36491.158,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 14596.463
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 18245.579,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 51087.621
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 54736.736,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 7298.232
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 7298.232,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
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
    Placement_check = Placement_Upgrade.filter((placement) => placement.Upgrade.level >= Selected.Upgrade.level);

    //user ka level
    if (Placement_check.length === 0) {
      // switch (Selected.Upgrade.level) {
      //   case 0:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 1,
      //       upgrade: 125
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 125,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 25
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 31.250,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 12.50
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 12.50,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 1:
      //     //upgrade level
      //     await Upgrade.update({
      //       level: 2,
      //       upgrade: 281.250
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     //upgrade level transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Upgraded package",
      //         payment: 281.250,
      //         user_id: user_info.id
      //       },
      //       {
      //         where:
      //         {
      //           user_id: user_info.id
      //         }
      //       }
      //     )

      //     //wallet payment added to refferal
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 56.250
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     //wallet payment added to refferal transaction
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: finfReff.id,
      //         reason: "Refferal",
      //         payment: 70.313,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     //wallet payment added to admin
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 28.125
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     //admin commision cutt
      //     await Transaction.update(
      //       {
      //         from: user_info.id,
      //         to: 1,
      //         reason: "Tax to admin",
      //         payment: 28.125,
      //         user_id: user_info.id
      //       },
      //       {}
      //     )
      //     break
      //   case 2:
      //     await Upgrade.update({
      //       level: 3,
      //       upgrade: 632.813
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 126.562
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 63.281
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 3:
      //     await Upgrade.update({
      //       level: 4,
      //       upgrade: 1423.82
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 284.76
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 142.38
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 4:
      //     await Upgrade.update({
      //       level: 5,
      //       upgrade: 3203.61
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 640.72
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 320.36
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 5:
      //     await Upgrade.update({
      //       level: 6,
      //       upgrade: 7208.13
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 1441.64
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 720.81
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 6:
      //     await Upgrade.update({
      //       level: 7,
      //       upgrade: 16218.29
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 3243.65
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 1621.82
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   case 7:
      //     await Upgrade.update({
      //       level: 8,
      //       upgrade: 36491.15
      //     }, {
      //       where:
      //       {
      //         user_id: user_info.id
      //       }
      //     }
      //     )
      //     await wallet.update(
      //       {
      //         payment: finfReff.wallet.payment + 7298.23
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: finfReff.id
      //         }
      //       })
      //     await wallet.update(
      //       {
      //         payment: adminWallet.wallet.payment + 3649.11
      //       }
      //       ,
      //       {
      //         where: {
      //           user_id: 1
      //         }
      //       })
      //     break
      //   default:
      //     // Handle the default case if needed
      //     break;
      // }
      res.json('koi bi ni hay bhai tere agay');
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
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 437.500,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 87.500
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 109.375,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 306.250
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 328.125,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 43.750
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 43.750,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 1:
        //upgrade levels
        await Upgrade.update({
          level: 2,
          upgrade: 984.375
        }, {
          where:
          {
            user_id: user_info.id
          }
        }
        )
        //upgrade levels transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: "Upgraded package",
            payment: 984.375,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        //payment to referal
        await wallet.update(
          {
            payment: finfReff.wallet.payment + 196.875
          }
          ,
          {
            where: {
              user_id: finfReff.id
            }
          })
        //payment refferal transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: finfReff.id,
            reason: "Referal",
            payment: 246.094,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // placement wallet
        await wallet.update(
          {
            payment: Placement_check[0].wallet.payment + 689.063
          }
          ,
          {
            where: {
              user_id: Placement_check[0].id
            }
          })
        // placement transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: Placement_check[0].id,
            reason: "placement payment",
            payment: 738.281,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
        // admin wallet
        await wallet.update(
          {
            payment: adminWallet.wallet.payment + 98.438
          }
          ,
          {
            where: {
              user_id: user_info.id
            }
          })
        // admin wallet transaction
        await Transaction.update(
          {
            from: user_info.id,
            to: 1,
            reason: " Tax for admin",
            payment: 98.438,
            user_id: user_info.id
          },
          {
            where:
            {
              user_id: user_info.id
            }
          }
        )
          break
        case 2:
            //upgrade levels
          await Upgrade.update({
            level: 3,
            upgrade: 2214.844
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          //upgrade levels transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 2214.844,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          //payment to referal
          await wallet.update(
            {
              payment: finfReff.wallet.payment + 442.969
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Referal",
              payment: 553.711,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 1550.391
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment",
              payment: 1661.133,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 221.484
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 221.484,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 3:
             //upgrade levels
             await Upgrade.update({
              level: 4,
              upgrade: 4983.398
            }, {
              where:
              {
                user_id: user_info.id
              }
            }
            )
            // upradde transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: "Upgraded package",
                payment: 4983.398,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
  
            //payment to referal
  
            await wallet.update(
              {
                payment: finfReff.wallet.payment + 996.680
              }
              ,
              {
                where: {
                  user_id: finfReff.id
                }
              })
            //payment refferal transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: finfReff.id,
                reason: "Refferal trasaction",
                payment: 1245.850,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // placement wallet
            await wallet.update(
              {
                payment: Placement_check[0].wallet.payment + 3488.379
              }
              ,
              {
                where: {
                  user_id: Placement_check[0].id
                }
              })
            // placement transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: Placement_check[0].id,
                reason: "placement payment Transaction",
                payment: 3737.549,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
            // admin wallet
            await wallet.update(
              {
                payment: adminWallet.wallet.payment + 498.340
              }
              ,
              {
                where: {
                  user_id: user_info.id
                }
              })
            // admin wallet transaction
            await Transaction.update(
              {
                from: user_info.id,
                to: 1,
                reason: " Tax for admin",
                payment: 498.340,
                user_id: user_info.id
              },
              {
                where:
                {
                  user_id: user_info.id
                }
              }
            )
          break
        case 4:
          //upgrade levels
          await Upgrade.update({
            level: 5,
            upgrade: 11212.646
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 11212.646,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 2242.529
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 2803.162,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 7084.853
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 8409.485,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 1121.265
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 1121.265,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 5:
           //upgrade levels
           await Upgrade.update({
            level: 6,
            upgrade: 25228.455
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 25228.455,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 5045.691
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 6307.114,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 17659.918
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 18921.341,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 2522.845
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 2522.845,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 6:
          //upgrade levels
          await Upgrade.update({
            level: 7,
            upgrade: 56764.023
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 56764.023,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 11352.805
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 14191.006,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 39734.816
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 42513.017,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 5676.402
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 5676.402,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        case 7:
          //upgrade levels
          await Upgrade.update({
            level: 8,
            upgrade: 127719.051
          }, {
            where:
            {
              user_id: user_info.id
            }
          }
          )
          // upradde transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: "Upgraded package",
              payment: 127719.051,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )

          //payment to referal

          await wallet.update(
            {
              payment: finfReff.wallet.payment + 25543.810
            }
            ,
            {
              where: {
                user_id: finfReff.id
              }
            })
          //payment refferal transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: finfReff.id,
              reason: "Refferal trasaction",
              payment: 31929.763,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // placement wallet
          await wallet.update(
            {
              payment: Placement_check[0].wallet.payment + 89403.336
            }
            ,
            {
              where: {
                user_id: Placement_check[0].id
              }
            })
          // placement transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: Placement_check[0].id,
              reason: "placement payment Transaction",
              payment: 95789.289,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          // admin wallet
          await wallet.update(
            {
              payment: adminWallet.wallet.payment + 12771.905
            }
            ,
            {
              where: {
                user_id: user_info.id
              }
            })
          // admin wallet transaction
          await Transaction.update(
            {
              from: user_info.id,
              to: 1,
              reason: " Tax for admin",
              payment: 12771.905,
              user_id: user_info.id
            },
            {
              where:
              {
                user_id: user_info.id
              }
            }
          )
          break
        default:
          // Handle the default case if needed
          break;
      }
      res.status(200).json('Upgrade successful'); // Send a success response
    }
  }

  // res.json({ placements, Placement_Upgrade, Placement_check })
  //placement end
};

const placementInvest = async (req, res) => {
  const { levels, pkg } = req.body;

  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);

  if (pkg == pakage_prices1) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices1,
      },
    });

    const percentage10 = (pakage_prices1 * 10) / 100;
    const percentage45 = (pakage_prices1 * 45) / 100;
    const percentage90 = (pakage_prices1 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices1,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices1,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices1 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices1,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices1,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices1,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices1,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices1 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices1,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices1,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices1 * 55) / 100;
        const percentage45 = (pakage_prices1 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices1 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices1,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
  } else if (pkg == pakage_prices2) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices2,
      },
    });

    const percentage10 = (pakage_prices2 * 10) / 100;
    const percentage45 = (pakage_prices2 * 45) / 100;
    const percentage90 = (pakage_prices2 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices2,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices2,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices2 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices2,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices2,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices2,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices2,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices2 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices2,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices2,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices2 * 55) / 100;
        const percentage45 = (pakage_prices2 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices2 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices2,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
  } else if (pkg == pakage_prices3) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices3,
      },
    });

    const percentage10 = (pakage_prices3 * 10) / 100;
    const percentage45 = (pakage_prices3 * 45) / 100;
    const percentage90 = (pakage_prices3 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices3,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices3,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices3 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices3,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices3,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices3,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices3,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices3 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices3,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices3,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices3 * 55) / 100;
        const percentage45 = (pakage_prices3 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices3 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices3,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
  } else if (pkg == pakage_prices4) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices4,
      },
    });

    const percentage10 = (pakage_prices4 * 10) / 100;
    const percentage45 = (pakage_prices4 * 45) / 100;
    const percentage90 = (pakage_prices4 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices4,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices4,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices4 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices4,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices4,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices4,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices4,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices4 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices4,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices4,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices4 * 55) / 100;
        const percentage45 = (pakage_prices4 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices4 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices4,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
  } else if (pkg == pakage_prices5) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices5,
      },
    });

    const percentage10 = (pakage_prices5 * 10) / 100;
    const percentage45 = (pakage_prices5 * 45) / 100;
    const percentage90 = (pakage_prices5 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices5,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices5,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices5 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices5,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices5,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices5,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices5,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices5 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices5,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices5,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices5 * 55) / 100;
        const percentage45 = (pakage_prices5 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices5 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices5,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
  } else if (pkg == pakage_prices6) {
    const findRight = await Profile.findOne({
      where: {
        left: { [Sequelize.Op.ne]: null },
        right: null,
        pkg: pakage_prices6,
      },
    });

    const percentage10 = (pakage_prices6 * 10) / 100;
    const percentage45 = (pakage_prices6 * 45) / 100;
    const percentage90 = (pakage_prices6 * 90) / 100;

    if (findRight) {
      // xx-------------------xx------------------------------xx---------------------xxx

      const usermake = await Profile.create({
        email: req.body.email,
        phone: req.body.phone,
        refferal: req.body.refferal,
        pkg: pakage_prices6,
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
      await Upgrade.create({
        user_id: user_info.id,
        profile_id: user_info.id,
        upgrade: 0,
      });

      await Refferal.create({
        placement_id: findRight.id,
        refferal: req.body.refferal,
        user_id: user_info.id,
      });
      const DirectReff = await Profile.findOne({
        where: { id: req.body.refferal },
      });

      const admin = await wallet.findOne({ where: { user_id: 1 } });

      await Pakage.create({
        user_id: user_info.id,
        pkg_price: pakage_prices6,
        pkg_name: req.body.pkg_name,
      });

      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
      const ReffkWallets1 = await wallet.findOne({
        where: { user_id: req.body.refferal },
      });
      const placementWallet = await wallet.findOne({
        where: { user_id: findRight.id },
      })

      if (req.body.refferal == 1) {
        await wallet.update(
          { payment: adminkWallets1.payment + pakage_prices6 },
          { where: { user_id: adminkWallets1.user_id } }
        );
        await Transaction.create({
          from: user_info.id,
          to: 1,
          reason: "commision with tax for admin",
          payment: pakage_prices6,
          user_id: 1,
        });
      } else {

        await wallet.update(
          { payment: adminkWallets1.payment + percentage10 },
          { where: { user_id: adminkWallets1.user_id } }
        ); // 10% for admin
        await wallet.update(
          { payment: ReffkWallets1.payment + percentage45 },
          { where: { user_id: ReffkWallets1.user_id } }
        ); // 45% for direct refferal
        await wallet.update(
          { payment: placementWallet.payment + percentage45 },
          { where: { user_id: findRight.id } }
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
      await wallet.create({
        payment: 0,
        user_id: user_info.id,
      });
      res.status(200).json({ msg: `from Right of ${pkg}`, findRight });

      // xx-------------------xx------------------------------xx---------------------xxx
    } else {
      const findLeft = await Profile.findOne({
        where: {
          left: null,
          pkg: pakage_prices6,
        },
      });
      if (findLeft) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          pkg: pakage_prices6,
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
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });
        await Refferal.create({
          placement_id: findLeft.id,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const DirectReff = await Profile.findOne({
          where: { id: req.body.refferal },
        });

        await Pakage.create({
          user_id: user_info.id,
          pkg_price: pakage_prices6,
          pkg_name: req.body.pkg_name,
        });
        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });
        const placementWallet = await wallet.findOne({
          where: { user_id: findLeft.id },
        })

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices6 },
            { where: { user_id: adminkWallets1.user_id } }
          );
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision and tax for admin",
            payment: pakage_prices6,
            user_id: 1,
          })
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage10 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
            { where: { user_id: ReffkWallets1.user_id } }
          ); // 45% for direct refferal
          await wallet.update(
            { payment: placementWallet.payment + percentage45 },
            { where: { user_id: findLeft.id } }
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
        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });
        res.json({ msg: `from Left of ${pkg}`, findLeft });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const usermake = await Profile.create({
          email: req.body.email,
          phone: req.body.phone,
          // level: 0,
          pkg: pakage_prices6,
          user_id: user_info.id,
        });
        await Pakage.create({
          user_id: user_info.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        });
        await Upgrade.create({
          user_id: user_info.id,
          profile_id: user_info.id,
          upgrade: 0,
        });

        await wallet.create({
          payment: 0,
          user_id: user_info.id,
        });

        await Refferal.create({
          // placement_id: findLeft.id?findLeft.id:1,
          refferal: req.body.refferal,
          user_id: user_info.id,
        });

        const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });
        const ReffkWallets1 = await wallet.findOne({
          where: { user_id: req.body.refferal },
        });

        const percentage55 = (pakage_prices6 * 55) / 100;
        const percentage45 = (pakage_prices6 * 45) / 100;

        if (req.body.refferal == 1) {
          await wallet.update(
            { payment: adminkWallets1.payment + pakage_prices6 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: 1,
            reason: "commision with tax for admin",
            payment: pakage_prices6,
            user_id: 1,
          });
          // res.status(200).json({ msg: "done" });
        } else {
          await wallet.update(
            { payment: adminkWallets1.payment + percentage55 },
            { where: { user_id: adminkWallets1.user_id } }
          ); // 10% for admin
          await wallet.update(
            { payment: ReffkWallets1.payment + percentage45 },
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
};

const Pakage_info = async (req, res) => {
  const userx = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(userx);
  const findUpdate = await Upgrade.findOne({
    where: { user_id: user_info.id }
  })
  // const your_next_package= findUpdate.level <=7 && findUpdate.level+1
  res.json(findUpdate)
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
  const refferal = await Refferal.findAll({
    where: { refferal: user_info.id },
    include: [
      { model: Profile, as: "ReffUsers", include: [{ model: Pakage }] },
    ],
  });
  res.status(200).send(refferal);
};

const findTransac = async (req, res) => {
  const user = req.headers.authorization.split(" ")[1];
  const user_info = jwt_decode(user);
  const transaction = await Transaction.findAll({
    where: { user_id: user_info.id },
  });
  res.json(transaction);
};

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
  makeProfile,
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
