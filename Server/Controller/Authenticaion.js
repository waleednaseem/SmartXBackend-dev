const db = require('../models')
const jwt = require('jsonwebtoken')
const jwt_decode = require('jwt-decode')
const { Sequelize } = require('sequelize');
const { sequelize } = require('../models');

//finding user
// const user=req.headers.authorization.split(' ')[1]
// const user_info= jwt_decode(user)


const User = db.User
const Refferal = db.Refferal
const Pakage = db.Pakage
const wallet = db.wallet
const Transaction = db.Transaction

const pakage_prices1 = 3000
const pakage_prices2 = 5000
const pakage_prices3 = 10000

const FIndUser = async (req, res) => {
  const user = req.headers.authorization.split(' ')[1]
  const user_info = jwt_decode(user)
  const users = await User.findOne({ where: { id:user_info.id} })
  const placement = await User.findOne({ where: { [Sequelize.Op.or]: [{ left: user_info.id }, { right: user_info.id }] } });
  const DirectReff= await User.findOne({where:{id:user_info.id},include:[{model:Refferal,as:'directReff'}]})

  res.json({users,placement,DirectReff})
}

const makeUser = async (req, res) => {
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const password = req.body.password;
  const hashedPassword = jwt.sign({ password }, 'teriMaaKiChot');
  const USER = await User.findOne({ where: { username: req.body.username } })

  const FindAllUser = await User.findOne()
  if (FindAllUser == null) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      refferal: 0
    })
    await wallet.create({
      payment: 0,
      user_id: 1
    })
   
  }
  const { pkg, from_user_payment, to_user_payment } = req.body
  const user = req.headers.authorization.split(' ')[1]
  const Admin_info = await User.findOne({ where: { id: 1 } })
  const user_info = jwt_decode(user)
  const walletpayment = await wallet.findOne({ where: { user_id: req.body.refferal } })  
  const admin = await wallet.findOne({ where: { user_id: 1 } })
  if (!USER) {
    if (pkg == pakage_prices1) {
      const findRight3000 = await User.findOne({
        where: {
          left: { [Sequelize.Op.ne]: null },
          right: null,
          pkg: pakage_prices1
        }
      });

      if (findRight3000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          level: findRight3000.level + 1,
          pkg: pakage_prices1,
        });

        await User.update({
          right: usermake.id
        }, {
          where: {
            id: findRight3000.id
          }
        });

        await Refferal.create({
          level_id: usermake.level,
          placement_id: findRight3000.id,
          refferal: req.body.refferal,
          user_id: usermake.id
        });
        const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
        
        const admin = await wallet.findOne({ where: { user_id: Admin_info.id } })

        await Pakage.create({
          user_id: usermake.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        })


        if (req.body.pkg_price == pakage_prices1) {
          await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 300,
            user_id: 1
          })
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 2700,
            user_id: usermake.id
          })
        } else if (req.body.pkg_price == pakage_prices2) {
          await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 300,
            user_id: 1
          })
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 2700,
            user_id: usermake.id
          })
        } else if (req.body.pkg_price == pakage_prices3) {
          await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin
          await wallet.update({ payment: walletpayment.payment + 9000 }, { where: { user_id: walletpayment.user_id } }) // 90% for user

          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 300,
            user_id: 1
          })
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 2700,
            user_id: usermake.id
          })
        }

        await wallet.create({
          payment: 0,
          user_id: usermake.id
        })
        res.status(200).json({ msg: 'from Right of 3000', findRight3000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const findLeft3000 = await User.findOne({
          where: {
            left: null,
            pkg: pakage_prices1,
            // pkg_price: 3000,
          }
        });
        if (findLeft3000) {
          // xx-------------------xx------------------------------xx---------------------xxx
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            refferal: req.body.refferal,
            level: findLeft3000.level + 1,
            pkg: pakage_prices1
          });

          await User.update({
            left: usermake.id
          }, {
            where: {
              id: findLeft3000.id
            }
          });
          await Refferal.create({
            level_id: usermake.level,
            placement_id: findLeft3000.id,
            refferal: req.body.refferal,
            user_id: usermake.id
          });

          const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
          // const pkg = await Pakage.findOne({ where: { user_id: req.body.refferal } })
          
          
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })

          if (req.body.pkg_price == pakage_prices1) {
            await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices2) {
            await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: walletpayment.payment + 4500 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices3) {
            await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: walletpayment.payment + 9000 }, { where: { user_id: walletpayment.user_id } }) // 90% for user

            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          }

          await wallet.create({
            payment: 0,
            user_id: usermake.id
          })
          res.status(200).json({ msg: 'from Left of 3000', findLeft3000 });
          // xx-------------------xx------------------------------xx---------------------xxx
        } else {
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            level: 0,
            pkg: pakage_prices1,
          });
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 300,
            user_id: Admin_info.id
          })
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'Purchased Pakage',
            payment: 2700,
            user_id: Admin_info.id
          })
          await wallet.create({
            payment: 0,
            user_id: usermake.id
          })
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } })
          res.status(200).json({ msg: 'no space found', usermake });
        }
      }

    } else if (pkg == pakage_prices2) {
      const findRight5000 = await User.findOne({
        where: {
          left: { [Sequelize.Op.ne]: null },
          right: null,
          pkg: pakage_prices2
        }
      });

      if (findRight5000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          level: findRight5000.level + 1,
          pkg: pakage_prices2
        });

        await User.update({
          right: usermake.id
        }, {
          where: {
            id: findRight5000.id
          }
        });

        await Refferal.create({
          level_id: usermake.level,
          placement_id: findRight5000.id,
          refferal: req.body.refferal,
          user_id: usermake.id
        });
        const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
        
        
        await Pakage.create({
          user_id: usermake.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        })

        if (req.body.pkg_price == pakage_prices1) {
            await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices2) {
            await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: walletpayment.payment + 4500 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 500,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 4500,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices3) {
            await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin

            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 1000,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 9000,
              user_id: usermake.id
            })
          }

        const walletx = await wallet.create({
          payment: 0,
          user_id: usermake.id
        })
        res.status(200).json({ msg: 'from Right of 5000', findRight5000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const findLeft5000 = await User.findOne({
          where: {
            left: null,
            pkg: pakage_prices2
          }
        });
        if (findLeft5000) {
          // xx-------------------xx------------------------------xx---------------------xxx
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            refferal: req.body.refferal,
            level: findLeft5000.level + 1,
            pkg: pakage_prices2
          });

          await User.update({
            left: usermake.id
          }, {
            where: {
              id: findLeft5000.id
            }
          });
          await Refferal.create({
            level_id: usermake.level,
            placement_id: findLeft5000.id,
            refferal: req.body.refferal,
            user_id: usermake.id
          });

          const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
          // const pkg = await Pakage.findOne({ where: { user_id: req.body.refferal } })
          
          
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })

          if (req.body.pkg_price == pakage_prices1) {
            await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices2) {
            await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: walletpayment.payment + 4500 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 500,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 4500,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices3) {
            await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin

            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 1000,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 9000,
              user_id: usermake.id
            })
          }

           await wallet.create({
            payment: 0,
            user_id: usermake.id
          })
          res.status(200).json({ msg: 'from Left of 5000', findLeft5000 });
          // xx-------------------xx------------------------------xx---------------------xxx
        } else {
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            level: 0,
            pkg: pakage_prices1,
          });
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 500,
            user_id: Admin_info.id
          })
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'Purchased Pakage',
            payment: 4500,
            user_id: Admin_info.id
          })
          await wallet.create({
            payment: 4500,
            user_id: usermake.id
          })
          await wallet.update({ payment: admin.payment + 4500 }, { where: { user_id: walletpayment.user_id } })
          res.status(200).json({ msg: 'no space found', usermake });
        }
      }
    } else if (pkg == pakage_prices3) {
      const findRight10000 = await User.findOne({
        where: {
          left: { [Sequelize.Op.ne]: null },
          right: null,
          pkg: pakage_prices3
        }
      });

      if (findRight10000) {
        // xx-------------------xx------------------------------xx---------------------xxx
        const usermake = await User.create({
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          phone: req.body.phone,
          refferal: req.body.refferal,
          level: findRight10000.level + 1,
          pkg: pakage_prices3
        });

        await User.update({
          right: usermake.id
        }, {
          where: {
            id: findRight10000.id
          }
        });

        await Refferal.create({
          level_id: usermake.level,
          placement_id: findRight10000.id,
          refferal: req.body.refferal,
          user_id: usermake.id
        });
        const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
        
        
        await Pakage.create({
          user_id: usermake.id,
          pkg_price: req.body.pkg_price,
          pkg_name: req.body.pkg_name,
        })

        if (req.body.pkg_price == pakage_prices1) {
          await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 300,
            user_id: 1
          })
          await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 2700,
            user_id: usermake.id
          })
        } else if (req.body.pkg_price == pakage_prices2) {
          await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
          await wallet.update({ payment: walletpayment.payment + 4500 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 500,
            user_id: 1
          })

          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 4500,
            user_id: usermake.id
          })
        } else if (req.body.pkg_price == pakage_prices3) {
          await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin

          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 1000,
            user_id: 1
          })

          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'you purchased pakage',
            payment: 9000,
            user_id: usermake.id
          })
        }

         await wallet.create({
          payment: 0,
          user_id: usermake.id
        })
        res.status(200).json({ msg: 'from Right of 10000', findRight10000 });
        // xx-------------------xx------------------------------xx---------------------xxx
      } else {
        const findLeft10000 = await User.findOne({
          where: {
            left: null,
            pkg: pakage_prices3
          }
        });
        if (findLeft10000) {
          // xx-------------------xx------------------------------xx---------------------xxx
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            refferal: req.body.refferal,
            level: findLeft10000.level + 1,
            pkg: pakage_prices3
          });

          await User.update({
            left: usermake.id
          }, {
            where: {
              id: findLeft10000.id
            }
          });
          await Refferal.create({
            level_id: usermake.level,
            placement_id: findLeft10000.id,
            refferal: req.body.refferal,
            user_id: usermake.id
          });

          const DirectReff = await User.findOne({ where: { id: req.body.refferal } })
          // const pkg = await Pakage.findOne({ where: { user_id: req.body.refferal } })
          
          
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })

          if (req.body.pkg_price == pakage_prices1) {
            await wallet.update({ payment: admin.payment + 300 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 300,
              user_id: 1
            })
            await wallet.update({ payment: admin.payment + 2700 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 2700,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices2) {
            await wallet.update({ payment: admin.payment + 500 }, { where: { user_id: 1 } }) // 10% for admin
            await wallet.update({ payment: walletpayment.payment + 4500 }, { where: { user_id: walletpayment.user_id } }) // 90% for user
            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 500,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 4500,
              user_id: usermake.id
            })
          } else if (req.body.pkg_price == pakage_prices3) {
            await wallet.update({ payment: admin.payment + 1000 }, { where: { user_id: 1 } }) // 10% for admin

            await Transaction.create({
              from: user_info.id,
              to: Admin_info.id,
              reason: 'tax for admin',
              payment: 1000,
              user_id: 1
            })

            await Transaction.create({
              from: 'meta mask',
              to: user_info.id,
              reason: 'you purchased pakage',
              payment: 9000,
              user_id: usermake.id
            })
          }

           await wallet.create({
            payment: 0,
            user_id: usermake.id
          })
          res.status(200).json({ msg: 'from Left of 10000', findLeft10000 });
          // xx-------------------xx------------------------------xx---------------------xxx
        } else {
          const usermake = await User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            phone: req.body.phone,
            level: 0,
            pkg: pakage_prices1,
          });
          await Pakage.create({
            user_id: usermake.id,
            pkg_price: req.body.pkg_price,
            pkg_name: req.body.pkg_name,
          })
          await Transaction.create({
            from: user_info.id,
            to: Admin_info.id,
            reason: 'tax for admin',
            payment: 1000,
            user_id: Admin_info.id
          })
          await Transaction.create({
            from: 'meta mask',
            to: user_info.id,
            reason: 'Purchased Pakage',
            payment: 9000,
            user_id: Admin_info.id
          })
          await wallet.create({
            payment: 9000,
            user_id: usermake.id
          })
          await wallet.create({
            payment: 9000,
            user_id: usermake.id
          })
          await wallet.update({ payment: admin.payment + 9000 }, { where: { user_id: walletpayment.user_id } })
          res.status(200).json({ msg: 'no space found', usermake });
        }
      }
    } else {
      res.json({ msg: 'non of the pakage found' })
    }
  } else {
    res.json('Username Already Exicted Please Try Another')
  }
}

const Login = async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.body.username
    }
  })

  if (!user) {
    return res.status(200).send('User not found')
  }
  const payload = {
    id: user.id
  };
  // const validPassword = await bcrypt.compare(req.body.password, user.password)
  const token = jwt.sign(payload, 'teriMaaKiChot');

  if (!token) {
    return res.status(401).send('Invalid password')
  }

  try {

    res.status(200).send({ message: 'Logged in successfully', token });
  } catch (err) {
    res.status(500).send({ message: 'Error creating token' });
  }
}

const userDetail = async (req, res) => {
  const user = await User.findByPk(req.body.id)
  res.status(200).send(user)
}

const showusers = async (req, res) => {

  const referral = await Refferal.findAll({
    where: { refferal: req.body.refferal },
    include: [{
      model: User,
      as: 'ReffUsers',
    }],
  });
  res.status(200).send(referral)
}

const refferals = async (req, res) => {
  // const user = await User.findAll()
  const user = await User.findAll({
    where: { id: req.body.id },
    attributes: ['id', 'username', 'phone', 'email'],
    include: [{
      model: Refferal,
      attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
      include: [{
        model: User,
        attributes: ['id', 'username', 'phone', 'email'],
        include: [{
          model: Refferal,
          attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
          include: [{
            model: User,
            attributes: ['id', 'username', 'phone', 'email'],
            include: [{
              model: Refferal,
              attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
              include: [{
                model: User,
                attributes: ['id', 'username', 'phone', 'email'],
                include: [{
                  model: Refferal,
                  attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
                  include: [{
                    model: User,
                    attributes: ['id', 'username', 'phone', 'email'],
                    include: [{
                      model: Refferal,
                      attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
                      include: [{
                        model: User,
                        attributes: ['id', 'username', 'phone', 'email'],
                        include: [{
                          model: Refferal,
                          attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
                          include: [{
                            model: User,
                            attributes: ['id', 'username', 'phone', 'email'],
                            include: [{
                              model: Refferal,
                              attributes: ['id', 'placement_id', 'level_id', 'refferal', 'user_id'],
                              include: [{
                                model: User,
                                attributes: ['id', 'username', 'phone', 'email'],
                                include: [{
                                  model: Refferal,
                                  include: [{
                                    model: User
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }]
    }]
  })
  res.status(200).send(user)
}

const placementInvest = async (req, res) => {
  const user = await User.findOne({ where: { id: req.body.id }, include: [{ model: Refferal, as: 'Refferal', include: [{ model: User, as: 'directReff' }] }] })

  // await Transaction.create({
  //   reason:'you purchased pakage',
  //   payment:3000,
  //   user_id:usermake.id
  // })

  if (user.pkg == pakage_prices1) {
    let placements = [];
    let placement = await User.findOne({

      // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
      where: {
        [Sequelize.Op.or]: [{ left: user.id, pkg: pakage_prices1 }, { right: user.id, pkg: pakage_prices1 }],
      },
      include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]

    })
    if (!placement) {
      placements.push(null);
    } else {
      placements.push(placement);
    }

    for (let i = 2; i <= 8; i++) {
      if (!placement) {
        break;
      }
      placement = await User.findOne({
        // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
        where: {
          [Sequelize.Op.or]: [{ left: placement.id, pkg: pakage_prices1 }, { right: placement.id, pkg: pakage_prices1 }]
        }, include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]
      })
      if (!placement) {
        placements.push(null);
      } else {
        placements.push(placement);
      }
    }
    res.status(200).json({
      placements: placements
    });
  } else if (user.pkg == pakage_prices2) {
    let placements = [];
    let placement = await User.findOne({

      // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
      where: {
        [Sequelize.Op.or]: [{ left: user.id, pkg: pakage_prices2 }, { right: user.id, pkg: pakage_prices2 }],
      },
      include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]

    })
    if (!placement) {
      placements.push(null);
    } else {
      placements.push(placement);
    }

    for (let i = 2; i <= 8; i++) {
      if (!placement) {
        break;
      }
      placement = await User.findOne({
        // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
        where: {
          [Sequelize.Op.or]: [{ left: placement.id, pkg: pakage_prices2 }, { right: placement.id, pkg: pakage_prices2 }]
        }, include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]
      })
      if (!placement) {
        placements.push(null);
      } else {
        placements.push(placement);
      }
    }
    res.status(200).json({
      placements: placements
    });
  } else if (user.pkg == pakage_prices3) {
    let placements = [];
    let placement = await User.findOne({

      // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
      where: {
        [Sequelize.Op.or]: [{ left: user.id, pkg: pakage_prices3 }, { right: user.id, pkg: pakage_prices3 }],
      },
      include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]

    })
    if (!placement) {
      placements.push(null);
    } else {
      placements.push(placement);
    }

    for (let i = 2; i <= 8; i++) {
      if (!placement) {
        break;
      }
      placement = await User.findOne({
        // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
        where: {
          [Sequelize.Op.or]: [{ left: placement.id, pkg: pakage_prices3 }, { right: placement.id, pkg: pakage_prices3 }]
        }, include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]
      })
      if (!placement) {
        placements.push(null);
      } else {
        placements.push(placement);
      }
    }
    res.status(200).json({
      placements: placements
    });
  }
}
// ----------------- TREND START
const ShowReff = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.body.id },
    attributes: ['username', 'left', 'right'],
    include: [{
      model: Refferal,
      as: 'left_placement',
      attributes: ['refferal', 'user_id', 'level_id', 'placement_id'],

    }, {
      model: Refferal,
      as: 'right_placement',
      attributes: ['refferal', 'user_id', 'level_id', 'placement_id'],

    }]
  });
  res.status(200).json(user)
};
const getUserByTrend = async (req, res) => {
  const UserID = req.params.userId

  const user = await User.findByPk(UserID, {
    include: [{
      model: Refferal,
      as: 'left_placement',
      attributes: ['refferal', 'user_id', 'level_id', 'placement_id'],

    }, {
      model: Refferal,
      as: 'right_placement',
      attributes: ['refferal', 'user_id', 'level_id', 'placement_id'],

    }]
  })
  res.status(200).json(user)
}
// -----------------TREND END
const wallets = async (req, res) => {
  const Walletx = await User.findOne({
    where: { id: req.body.id },
    attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
    include: [{
      model: wallet,
      attributes: ['payment']
    }]
  })
  res.json(Walletx)
}

const UserUpgrade = async (req, res) => {

  const user = await User.findOne({ where: { id: req.body.id }, include: [{ model: Refferal, as: 'Refferal', include: [{ model: User, as: 'directReff' }] }] })

  const placements = [];

  // await Transaction.create({
  //   reason:'you purchased pakage',
  //   payment:3000,
  //   user_id:usermake.id
  // })

  let placement = await User.findOne({

    // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
    where: {
      [Sequelize.Op.or]: [{ left: user.id }, { right: user.id }],
    },
    include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]

  })
  if (!placement) {
    placements.push(null);
  } else {
    placements.push(placement);
  }

  for (let i = 2; i <= 8; i++) {
    if (!placement) {
      break;
    }
    placement = await User.findOne({
      // attributes: ['username', 'email', 'phone', 'left', 'right', 'level'],
      where: {
        [Sequelize.Op.or]: [{ left: placement.id }, { right: placement.id }]
      }, include: [{ model: Pakage, attributes: ['pkg_name', 'pkg_price'] }]
    })
    if (!placement) {
      placements.push(null);
    } else {
      placements.push(placement);
    }
  }
  // Payment 
  // if(placements[0] != null&&placements[0].Pakage !=null&&placements[0].Pakage.pkg_price==req.body.prices){
  //   // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })

  // res.json({place_:placements[0]})
  // }else if(placements[1]!= null&&placements[1].Pakage !=null&&placements[1].Pakage.pkg_price==req.body.prices){
  //   // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[1]})
  // }else if(placements[2]!= null&&placements[2].Pakage !=null&&placements[2].Pakage.pkg_price==req.body.prices){
  //   // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[2]})
  // }else if(placements[3]!= null&&placements[3].Pakage !=null&&placements[3].Pakage.pkg_price==req.body.prices){
  //   // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[3]})
  // }else if(placements[4]!= null&&placements[4].Pakage !=null&&placements[4].Pakage.pkg_price==req.body.prices){
  //  // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[4]})
  // }else if(placements[5]!= null&&placements[5].Pakage !=null&&placements[5].Pakage.pkg_price==req.body.prices){
  //  // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[5]})
  // }else if(placements[6]!= null&&placements[6].Pakage !=null&&placements[6].Pakage.pkg_price==req.body.prices){
  //  // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[6]})
  // }else if(placements[7]!= null&&placements[7].Pakage !=null&&placements[7].Pakage.pkg_price==req.body.prices){
  //  // await Transaction.create({
  //     //   reason:'for placement',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'Direct Reff',
  //     //   payment:3000,  // 45%
  //     //   user_id:usermake.id
  //     // })
  //   // await Transaction.create({
  //     //   reason:'admin Commision',
  //     //   payment:300,    //10%
  //     //   user_id:1
  //     // })
  //     res.json({place_:placements[7]})
  // }else{
  //   res.json('All are not elegible for placement Reward!')
  // }

  res.status(200).json({
    placements
  });
}

const levelFromTable = async (req, res) => {

  const refferals = await Refferal.findAll({
    where: { level_id: 2 },
    include: [{
      model: User,
    }]
  })

  res.status(200).json(refferals)
}

const FindUserPakage = async (req, res) => {
  const refferal = await Refferal.findAll({ where: { refferal: req.body.user_id }, include: [{ model: User, as: 'ReffUsers', include: [{ model: Pakage }] }] })
  res.status(200).send(refferal)
}

const findTransac = async (req, res) => {
  const transac = await Transaction.findAll({ where: { user_id: 12 } })
}

const decode = async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    const userDecode = await jwt_decode(user.password);
    res.json({ user: userDecode });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}



module.exports = {
  makeUser,
  Login,
  userDetail,
  showusers,
  placementInvest,
  refferals,
  levelFromTable,
  UserUpgrade,
  ShowReff,
  getUserByTrend,
  wallets,
  FIndUser,
  FindUserPakage,
  findTransac,
  decode
}