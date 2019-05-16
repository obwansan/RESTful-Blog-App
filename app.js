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

// Create a blog schema (pattern of data every blog must have, bit like a class interface in PHP and Typescript)
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

// Compile the Blog schema into a Blog model (kind of like a class in PHP) that can be used to create, read, update and delete blogs in the DB.
var Blog = mongoose.model('Blog', blogSchema);

app.get('/', function(req, res) {
  res.redirect('/blogs');
})

// INDEX restful route
app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});

// NEW restful route
app.get('/blogs/new', function(req, res) {
  res.render('new');
});

// CREATE ROUTE
app.post('/blogs', function(req, res) {
  // Create blog
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render('new');
    } else {
      // then redirect to the index
      res.redirect('/blogs');
    }
  }) 
});

// Start the server, running on port 3000
app.listen(3000, function(req, res) {
  console.log("restful blog app server is running...")
})
