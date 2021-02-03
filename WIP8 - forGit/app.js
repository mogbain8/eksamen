const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const { result } = require('lodash');
const { render } = require('ejs');
// express app
const app = express();

const dbURI = 'mongodb+srv://blogger1:blogbruger1@nodeblog.n213x.mongodb.net/Hovedopgave?retryWrites=true&w=majority'

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err))



// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
//dette stykke middleware parser urlencoded data fra feks min create.ejs  fil. og parser det indtil noget jeg akn bruge med et request objekt feks min Post metde
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

//routes
app.get('/', (req, res) => {
  res.redirect('/blogs')
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// blog routes
app.get('/blogs', (req, res) => {
  Blog.find().sort ({ createdAt: -1})//mongoose tilføjer time stamps for mig 
  // Jeg bruger Blog modellen og find metoden. find medtoden giver mig lov til at lave et query og få en liste over alle de dokumenter der passer med det filter/schema jeg har defineret i Blog modellen 
    .then((result) => {
      res.render('index', { title: 'All blogs', blogs: result})
    })
    .catch((err) => {
      console.log(err);
    })
});

app.post('/blogs', (req, res) => {
  const blog = new Blog(req.body);

  blog.save()
    .then((result) => {
      res.redirect('./blogs');
    })
    .catch((err) => {
      console.log(err);
    })
})

//det r vigtigt at /blogs/create er over /blogs/:id ellers får man en error  (Error: Argument passed in must be a single String) 
app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

app.get('/blogs/:id', (req, res) =>{
  const id = req.params.id
  Blog.findById(id)
  .then((result) => {
    res.render('details', { blog: result, title: 'Blog details'});
  })
  .catch((err) => {
    console.log(err);
  })
})

app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;
  
  Blog.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});


// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
