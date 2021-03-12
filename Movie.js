var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//connect method
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//movie schema
var MovieSchema = new Schema({
    title: String,
    yearReleased: {type: Number, min:[1900, 'Must be greater than 1899'], max:[2100,'Must be less than 2100'] },
    genre: String,
    actors: [{ actorName: String, characterName: String }]
});

MovieSchema.pre('save', function(next) {
    var movie = this;

    //hash the password
    if (!movie.contain(movie.actors)) return next();

    bcrypt.hash(movie.title, movie.yearReleased, movie.genre, movie.actors, function(err, hash) {
        if (err) return next(err);

        //save movie
        movie.title = hash;
        movie.yearReleased = hash;
        movie.genre = hash;
        movie.actors = hash;

        next();
    });
});

MovieSchema.methods.comparePassword = function (password, callback) {
    var movie = this;

    bcrypt.compare(password, user.password, function(err, isMatch) {
        callback(isMatch);
    })
}

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);