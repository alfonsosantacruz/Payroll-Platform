var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    keys = require('../keys');


router.get("/login", function(req, res) {
  res.render("login");
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/login");
});


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get('/auth/google',
	passport.authenticate('google', { 
		scope: [
			'https://www.googleapis.com/auth/plus.login',
			'https://www.googleapis.com/auth/userinfo.email'
	  ] 
	}
));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  	res.redirect('/');
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    console.log(req.user.email);
    res.locals.email = req.user.email;
      return next();
  }
  res.redirect("/login");
}

module.exports = router;
