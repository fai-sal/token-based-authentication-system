var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var { userModel } = require('../user');
var { secretKey } = require('./config');

var registerNewUser = (req, res) => {
    let { name, email, password } = req.body;
    password = bcrypt.hashSync(password, 8);
    const newUser = new userModel({
        name, email, password
    });
    newUser.save((error, user) => {
        if (error) {
            console.error(error);
            res.status(500).send('error registering new user');
        }
        var token = jwt.sign({ id: user._id }, secretKey.secret, {
            expiresIn: 86400
        });

        res.status(200).send({ auth: true, token: token, message: 'New user successfully registered' });

    })
}

var me = (req, res, next) => {
    console.log('me function ');
    userModel.findById(req.userId, { password: 0 }, (error, user) => {
        if (error)
            return res.status(500).send('there was a problem finding the user');
        if (!user)
            return res.status(404).send('No user found');

        let data = {
            user: user,
            fa: res.faisal
        }
        res.status(200).send(data);

    })
}

var login = (req, res) => {
    userModel.findOne({ email: req.body.email }, (error, user) => {
        if (error)
            return res.status(500).send('error in the server');
        if (!user)
            return res.status(404).send('user not found');
        //console.log('user : ', user)
        var isPasswardValid = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswardValid)
            return res.status(401).send({ auth: false, token: null });

        let token = jwt.sign({ id: user._id }, secretKey.secret, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token: token });
    });
}

var logout = (req, res) => {
    res.status(200).send({ auth: false, token: null })
}
module.exports = {
    registerNewUser,
    me,
    login,
    logout,
    //   customMiddleware
}