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
  const { levels } = req.body;

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
  const percentage10 = (pakage_prices1 * 10) / 100;
  const percentage20 = (pakage_prices1 * 20) / 100;
  const percentage70 = (pakage_prices1 * 70) / 100;
  // Selected.Upgrade.upgrade
  // placements[2].Upgrade.upgrade

  //placement start
  let placements = [];

  let placement = await Profile.findOne({
    where: {
      [Sequelize.Op.or]: [
        { left: Selected.user_id, pkg: pakage_prices4 },
        { right: Selected.user_id, pkg: pakage_prices4 },
      ],
    },
    include: [{ model: Pakage, attributes: ["pkg_name", "pkg_price"] }],
    include: [{ model: Upgrade }],
  });
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
      include: [{ model: Pakage, attributes: ["pkg_name", "pkg_price"] }],
      include: [{ model: Upgrade }],
    });
    if (placement) {
      placements.push(placement);
    }
  }


  res.json(Selected)
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

const levelFromTable = async (req, res) => {
  const refferals = await Refferal.findAll({
    where: { level_id: 2 },
    include: [
      {
        model: Profile,
      },
    ],
  });

  res.status(200).json(refferals);
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
  refferals,
  levelFromTable,
  Placements,
  ShowReff,
  getUserByTrend,
  wallets,
  FIndUserDetail,
  FindUserPakage,
  findTransac,
  decode,
};
