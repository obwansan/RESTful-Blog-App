var expressSanitizer = require('express-sanitizer'),
methodOverride = require('method-override'),
bodyParser = require('body-parser'),
mongoose       = require('mongoose')
express        = require('express'),
app            = express();

// Calling express() assigns an 'instance of the express class' (i.e. an object) to the variable 'app'.
// So you can then use all the methods on the app object. So the app itself is just an object with methods!

// APP CONFIG
// Tell mongoose to connect to the server we have running (mongod)
// Connect to restful_blog_app DB. If the app DB doesn't exist, it will be created and connected to.
mongoose.connect("mongodb://localhost/restful_blog_app", { useNewUrlParser: true });
// Set the app to use ejs as it's template engine (don't need to use .ejs prefix on rendered files)
app.set("view engine", "ejs");
// Allows us to configure our own stylesheet in public folder
app.use(express.static("public")); 
// Have to configure this to use req.body.whatever
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
// The argument is what method-override should look for in the URL.
// Tells app, when you get a request that has _method as a parameter in the query string, take whatever type _method is assigned and treat the request as that type (see form action attribute in app.js)
app.use(methodOverride("_method"));


// Create a blog schema (pattern of data every blog must have, bit like a class interface in PHP and Typescript)
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

// Compile the Blog schema into a Blog model (kind of like a class in PHP) that can be used to create, read, update and delete blogs in the DB.
var Blog = mongoose.model('Blog', blogSchema);

// The root endpoint/URI redirects to '/blogs' endpoint/URI
app.get('/', function(req, res) {
  res.redirect('/blogs');
})

// INDEX restful route
app.get('/blogs', function(req, res) {
  // Get all blogs from the db.blogs database
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      // Pass them to the index page to be rendered
      res.render('index', {blogs: blogs});
    }
  });
});

// NEW restful route
app.get('/blogs/new', function(req, res) {
  // Render the (empty) blog form 
  res.render('new');
});

// CREATE restful route
app.post('/blogs', function(req, res) {
  // Prevent XSS 
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // Create blog in db.blogs database
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render('new');
    } else {
      // then redirect to the index page
      res.redirect('/blogs');
    }
  }) 
});

// SHOW restful route
// Clicking the 'Read More' button on a blog listed on the INDEX page triggers a get request (because it's just an HTML link to a URI) and hits this route.
// req.params.id is the ':id' in the URL. It's stored in req.params 
app.get('/blogs/:id', function(req, res) {
  // Finds the blog in the db.blogs database using the ID in the URI/params object on the request object.
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      // Render the individual blog
      res.render("show", {blog: foundBlog});
    }
  })
});

// EDIT restful route
app.get('/blogs/:id/edit', function(req, res) {
  // Must be that the found blog object is passed into the second argument of the callback function.
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect('/blogs');
    } else {
      // Render the blog form (populated with blog data)
      res.render('edit', {blog: foundBlog});
    }
  })
});

// UPDATE restful route
app.put('/blogs/:id', function(req, res) {
  // Prevent XSS
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // Find the blog (object or 'document') using its ID and update it using the req.body.blog object.
  // Potentially confusing as req.body.blog has a property called 'body' (as well as title and image).
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
    if(err) {
      res.redirect('/blogs');
    } else {
      // Redirect to the SHOW route, which will find the updated blog and render it.
      res.redirect('/blogs/' + req.params.id);
    }
  })
});

// DELETE restful route
app.delete('/blogs/:id', function(req, res) {
  // destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  })
  // redirect somewhere

});

// Start the server, running on port 3000
app.listen(3000, function(req, res) {
  console.log("restful blog app server is running...")
})
