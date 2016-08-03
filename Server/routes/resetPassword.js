var express = require('express');
var router = express.Router();
var Sequelize = require("sequelize");
var nodemailer = require('nodemailer');
var hash = require('./encode').hash;

router.post('/', function(req, res, next) {
 		
 		console.log(" resetting password -- "  + " , " + req.body  ) ;
		
		var newUser = {} ;
		var email =  req.body.params.email.toLowerCase();
		var action = req.body.params.action ;
		var resetCode = -1; 
		
		var min = 10000 ; // RESET CODE MIN NUMBER 
		var max = 99999 ; // RESET CODE MAX NUMBER
		var userExists = false ;

		// SEE IF THE USER EXISTS FIRST
		Users.sync().then(function () {
			
			Users.findOne({
				  where: {username: req.body.params.email}
				}).then(function(user) {
				
					  console.log('searched for user ');
					
					if (!user){
						console.log(" user not found");
						res.send("user_not_found");
						return "user_not_found" ;
					}
					else{
						userExists = true ;
						console.log(" username exists ");
						processRequest(action, email);
					}						
					
				}).catch(function (error){
					log.console (" IN THE ERROR returning username is free");
					res.send("error");
					return "error" ;
				});
		});

		// PROCESS THE REQUEST AFTER FINDING THE USER
		function processRequest(action, email){

			console.log('process request function');

			// GENERATE RESET CODE AND EMAIL IT TO THE USER
			if (action == "generateResetCode"){ 

             	resetCode = Math.floor(Math.random() * (max - min + 1)) + min; // GENERATE A NUMBER BETWEEN MIN AND MAX
				var now = new Date();
				var expires =  new Date( now.getTime() + (10 * 60 * 1000)).getTime(); // TOKEN EXPIRES IN 10 MIN	

	             Users.update({
			
				  	resetToken: resetCode,
				  	tokenExpiresAt: expires
					
					}, {
				  where: {
					  username: email
				  	}
				}).then(function(){
					sendEmail(resetCode, email);
					res.send('code_sent');	
				});
			}
			// CHECK IF USER TRIED TO SET NEW PASSWORD
			else if (action == "setNewPassword") {

				saveNewPassword();
			}
		}

		// SAVE NEW PASSWORD FUNCTION
		function saveNewPassword(){

				// IF TOKEN IS -1 THEN IT IS NOT VALID
				if (req.body.params.token == "-1"){

					res.send('invalid_token');
					return 'invalid_token';
				}

				// MAKE A HASH OF THE NEW PASSWORD
				hash(req.body.params.password, function(err, salt, hash){

					if (err) throw err;
					
					newUser.salt = salt;
					newUser.hash = hash;
				
					var now = new Date(); // GET CURRENT TIME

					// FIND A USER WITH THIS TOKEN
					Users.findOne({
						where: {	username: email, 
						  			resetToken: req.body.params.token,
						  			tokenExpiresAt: { $gt: now  } // token hasn't expired
						}
						}).then(function(user) {
						
							 console.log('searched for user and token ');
							
							if (!user){ // CAN'T FIND A MATCH OF USER AND TOKEN
								res.send("invalid_token");
								return "invalid_token" ;
							}
							// UPDATE THE USER THAT WAS FOUND WITH MATCHING TOKEN
							else{
									// TRY TO UPDATE THE USER WITH THE NEW PASSWORD
									Users.update({
			
									  	password: newUser.hash,
										salt: newUser.salt,
										resetToken: "-1"

										}, {
									  	where: {	username: email, 
									  				resetToken: req.body.params.token,
									  				tokenExpiresAt: { $gt: now  } // token hasn't expired
									  	}
									}).then(function(user){

										console.log('new_password_saved');
										res.send("new_password_saved");
										return "new_password_saved";
									
									}).catch(function (error){
										res.send('invalid_token');
										return "invalid_token";
									});
							}						
							
						}).catch(function (error){
							log.console (" IN THE ERROR");
							res.send("error");
							return "error" ;
						});
				});
		}


		// SEND EMAIL VIA NODEMAILER - https://github.com/nodemailer/nodemailer
		function sendEmail(token, toEmail) {

			console.log("Send token " + token + " to email: " + toEmail);

			    var smtpTransport = nodemailer.createTransport('SMTP', {
			        service: 'SendGrid',
			        auth: {
			          user: '!! YOUR SENDGRID USERNAME !!',
			          pass: '!! YOUR SENDGRID PASSWORD!!'
			        }
			      });

			      var mailOptions = {
			        to: toEmail,
			        from: 'passwordreset@demo.com',
			        subject: 'App Password Reset Code',
			        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			          'Enter the reset code in the App: ' + token + '\n\n' +
			          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			      };
			      smtpTransport.sendMail(mailOptions, function(err) {
			        console.log('An Email has been sent');
			        return "code_sent" ;
			      });
		}
}); 			
				
module.exports = router;