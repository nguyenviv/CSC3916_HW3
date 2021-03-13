/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movie');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')

    //Retrieve movies
    .get(function (req, res) {
            Movie.find({}, function (err,movies) {
                if (err) throw err;
                else
                    console.log(movies);
                res = res.status(200);
                res.json({success: true, msg: 'GET movies.'});
            });
        }
    )
    /*.get(function (req, res) {
            var movie = new Movie();
            Movie.find({}, function (err,) {
                if (err) throw err;
                else
                    console.log(movie);
                    res = res.status(200);
                    res.json({success: true, msg: 'GET movies.'});
            });
        }
    )*/

    //Save movies
    .post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.Title || !req.body.Genre || !req.body.Year || !req.body.Actors && req.body.Actors.length) {
            res.json({success: false, msg: 'Please pass Movie Title, Year released, Genre, and Actors(Actor Name and Character Name)'});
        }
        else {
            if(req.body.Actors.length < 3) {
                res.json({ success: false, message: 'Please include at least three actors.'});
            }
            else {
                var movie = new Movie();
                movie.Title = req.body.Title;
                movie.Year = req.body.Year;
                movie.Genre = req.body.Genre;
                movie.Actors= req.body.Actors;

                movie.save(function(err) {
                    if (err) {
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'A movie with that title already exists.'});
                        else
                            return res.send(err);
                    }
                    res.json({ message: 'Movie successfully created.' });
                });
            }
        }
    })

    //Update movies
   .put(authJwtController.isAuthenticated, function(req, res) {
       var movie = new Movie();
       movie.Title = req.body.Title;
       movie.Year = req.body.Year;
       movie.Genre = req.body.Genre;
       movie.Actors= req.body.Actors;

       if (Movie.find({Title: movie.Title}, function (err, m) {
           movie.save(function (err, m) {
               if (err) throw err;
               else {
                   res = res.status(200);
                   console.log('Movie successfully updated.');
               }
           });
       }));

       /*movie.find(function (err, movies){
           if (err) res.status(500).send(err);
           //return movies
           res.json(movies);

       });*/
   })

    //Delete movies
    .delete(authController.isAuthenticated, function(req, res) {
        var movie = new Movie();
        movie.Title = req.body.Title;
        movie.Year = req.body.Year;
        movie.Genre = req.body.Genre;
        movie.Actors= req.body.Actors;

        if (Movie.find(req.body.Title, function (err) {
            movie.remove(function (err) {
                if (err) throw err;
                else {
                    res = res.status(200);
                    console.log('Movie successfully removed.');
                }
            });
        }));
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


