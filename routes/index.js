var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var {User}  = require('../models/user');



passport.use(new Strategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            console.log(user);
            console.log(err);
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            // return done(null, user);
            user.validatePassword(password)
                .then(function (value) {
                    console.log(value);
                    if (value) {
                        return done(null, user)
                    } else {
                        return done(null, false);
                    }
                })


        });
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
.catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/dashboard');
});

router.post('/signup', function(req, res, next) {

    var username = req.body.username;
    var password = req.body.password;
    var firstName = 'krishna';
    var lastName = 'rokhale';

    User.find({username})
        .count()
        .then(count => {
            if (count > 0) {
            // There is an existing user with the same username
        res.send({message: 'There is an existing user with the same username!'})
    }
    // If there is no existing user, hash the password
    return User.hashPassword(password);
    })
    .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
    })
    .then(user => {
            return res.status(201).json(user.serialize());
            res.redirect('login');
    })
    .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
    });


});

router.get('/signup', function(req, res, next) {
    res.render('signup');
});



router.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
});

router.get('/dashboard', function (req, res) {
    if(!req.user){
        res.redirect('/login')
    } else {
        res.render('dashboard');
    }

});

// app.post('/login',
//     passport.authenticate('local'),
//     function(req, res) {
//         // If this function gets called, authentication was successful.
//         // `req.user` contains the authenticated user.
//         res.redirect('/users/' + req.user.username);
//     });

router.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login' }));


module.exports = router;
