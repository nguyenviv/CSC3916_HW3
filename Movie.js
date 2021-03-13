var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//connect method
//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    yearReleased: {type: Number, min:[1900, 'Must be greater than 1899'], max:[2100,'Must be less than 2100'], required: true },
    genre: { type:String, required: true},
    actors: [{ actorName: String, characterName: String }]
});

MovieSchema.find(function (err, movies){
    if (err) res.status(500).send(err);
    //return movies
    res.json(movies);

});
/*//Get/Read movies
MovieSchema.get('get', function (next){
    var movie = this;

});

//Post/Create movies
MovieSchema.save('save', function(next) {
    var movie = this;
    next();
});

//Put/Update movies
MovieSchema.update('update', function (next){
    var movie = this;

});

//Delete movies
MovieSchema.delete('delete', function (next){
    var movie = this;

});*/

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);