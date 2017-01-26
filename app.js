/**
 * Module dependencies.
 */
var Prismic = require('prismic-nodejs');
var app = require('./config');
var PORT = app.get('port');
var PConfig = require('./prismic-configuration');
var request = require('request');

// Render the 404 page
function render404(req, res) {
  res.status(404);
  res.render('404');
}

// Start the server
app.listen(PORT, function() {
  console.log('Point your browser to http://localhost:' + PORT);
});

// Middleware to connect to the API
app.use((req, res, next) => {
  Prismic.api(PConfig.apiEndpoint,{accessToken: PConfig.accessToken, req: req})
  .then((api) => {
    req.prismic = {api: api};
    res.locals.ctx = {
      endpoint: PConfig.apiEndpoint,
      linkResolver: PConfig.linkResolver
    };
    next();
  }).catch(function(err) {
    if (err.status == 404) {
      res.status(404).send('There was a problem connecting to your API, please check your configuration file for errors.');
    } else {
      res.status(500).send('Error 500: ' + err.message);
    }
  });
});


/**
* preconfigured prismic preview
*/
app.get('/preview', function(req, res) {
  return Prismic.preview(req.prismic.api, PConfig.linkResolver, req, res);
});


/**
* Route for the magazine homepage
*/
app.route('/magazine').get(function(req, res) {
  
  // Query the homepage content
  req.prismic.api.getSingle("une").then(function(homeContent) {

    // Render the magazine homepage
    res.render('home', {homeContent: homeContent});
  });
});


/**
* Route for the magazine pages
*/
app.route('/magazine/:uid').get(function(req, res) {
  
  // Define the UID from the url
  var uid = req.params.uid;
  
  // Query the page content by the uid
  req.prismic.api.getByUID('page', uid).then(function(pageContent) {

    // Render the magazine page
    res.render('page', {pageContent: pageContent});
  });
});


/**
* Index redirects to the magazine homepage
*/
app.get('/', function(req, res) {
  res.redirect('/magazine');
});