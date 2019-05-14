var bodyParser = require('body-parser'),
mongoose       = require('mongoose')
express        = require('express'),
app            = express();

// Tell mongoose to connect to the server we have running (mongod)
// Connect to restful_blog_app DB. If the app DB doesn't exist, it will be created and connected to.
mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true });

// Set the app to use ejs as it's template engine (don't need to use .ejs prefix on rendered files)
app.set("view engine", "ejs");

// allows us to configure our own stylesheet in public folder
app.use(express.static("public")); 

// Have to configure this to use req.body.whatever
app.use(bodyParser.urlencoded({extended:true}));

// Create a blog schema (pattern of data every blog must have, bit like a class interface in PHP and ES6)
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

// Compile the Blog schema into a Blog model (kind of like a class in PHP) that can 
// be used to create, read, update and delete blogs in the DB.
// You pass the singular version of your model (called "Blog") and mongoose automagically 
// creates a pluralised collection in the database (e.g. db.blogs).
// Convention is to capitalize a model ("Blog"), just like with PHP classes...
var Blog = mongoose.model('Blog', blogSchema);

app.get('/', function(req, res) {
  res.redirect('/blogs');
})

// INDEX restful route
// After the '/blogs' route is hit (i.e. a get request to '/blogs' is performed by entering 
// that URL), a callback function is called. It's passed the request and response object (how?)
// When Blog.find() returns all blogs from the mongoDB:
// - all the blogs are returned and passed as an object into the callback. So is an error message, if there is one.
// - the passed callback function is called. The inner callback has access to the response object
// passed into the outer callback (for res.render) and all the blogs. These are passed into index.ejs
// as the 'blogs' value on the 'blogs' key (which can be used in index.ejs).
app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});


// Start the server, running on port 3000
app.listen(3000, function(req, res) {
  console.log("restful blog app server is running...")
})
