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
      refferal: Reff.refferal,
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
      package:true
    },{
      user_id: user_info.id,
      pkg_price: pkg,
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

    if (Reff.refferal == 1) {
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
        refferal: Reff.refferal,
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
        package:true
      },{
        user_id: user_info.id,
        pkg_price: pkg,
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

      if (Reff.refferal == 1) {
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
        refferal: Reff.refferal,
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
        package:true
      },{
        user_id: user_info.id,
        pkg_price: pkg,
      });
      const adminkWallets1 = await wallet.findOne({ where: { user_id: 1 } });

      const percentage55 = (pkg * 55) / 100;
      const percentage45 = (pkg * 45) / 100;

      if (Reff.refferal == 1) {
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