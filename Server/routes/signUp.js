var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");

var hash = require('./encode').hash;

router.post('/', function(req, res, next) {
 		
 		console.log(" singing up -- "  + " , " + req.body  ) ;
		
		var newUser = {} ;
		var email =  req.body.params.email.toLowerCase();
		
		hash(req.body.params.password, function(err, salt, hash){
			  if (err) throw err;
			  // store the salt & hash in the "db"
			  console.log('in the hash');
			  newUser.salt = salt;
			  newUser.hash = hash;
			  
			Users.sync().then(function () {
			
				  console.log('in the sync');
				Users.findOne({
					  where: {username: req.body.params.email}
					}).then(function(user) {
					
						  console.log('searched for user ');
						
						if (!user){
							console.log(" user not found")
							
						 Users.create({
								username: email,
								email: email,
								password: newUser.hash,
								salt: newUser.salt
							})
							.then(function (user) {
							
									  req.session.regenerate(function(){
										// Store the user's primary key
										// in the session store to be retrieved,
										// or in this case the entire user object
										req.session.user = user;
										req.session.username = req.body.params.email;
		  
										console.log(" saving session user ");
										res.send(req.session.user);
								// res.send("success");
								})
								 return "success";
							})
							.catch(function(error) {
								 res.send("error");	
								 return "error";
									 // Ooops, do some error-handling
							});	
						}
						else{
							console.log(" username exists ");
							res.send("USER_EXISTS");
							return " username exists ";
							//return "username exists" ;
						}						
						
					}).catch(function (error){
						log.console (" IN THE ERROR returning username is free");
						return "username free" ;
					});
			});
		});
}); 
				
				
module.exports = router;