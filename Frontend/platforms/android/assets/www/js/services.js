angular.module('starter.services', [])

.factory('IonicLogin', function( $http, $state, $ionicPopup, $ionicLoading) {

  function login(email, password){

      $ionicLoading.show({
              template: 'Creating Account...'
          });

      $http.post("http://localhost:3000/login",
             { params: {
                         "email": email,
                         "password": password}
                        })
               .success(function(response) {

                    $ionicLoading.hide();

              if ( response == "LOGIN_FAIL" ){
                    $ionicPopup.alert({
                     title: 'Login Failed',
                      template: 'Wrong email and/or password.'
                    });
              }
             else{ // SUCCESS

                  window.localStorage['session'] = JSON.stringify(response);
                  $state.transitionTo('tab.dash');
             }
            })
            .error(function(response) {

                   $ionicLoading.hide();

                   $ionicPopup.alert({
                       title: 'Login',
                       template: 'Service unavailable, make sure you are online.'
                   });
            });
  }


  function logout(email){

        $ionicLoading.show({
              template: 'Logging Out...'
          });

        $http.post("http://localhost:3000/logout",
             { params: { "email": email }})
               .success(function(response) {

                    $ionicLoading.hide();

              if ( response == "LOGIN_FAIL" ){
                    $ionicPopup.alert({
                     title: 'Logout Failed',
                      template: 'Oops something went wrong.'
                    });
              }
             else{ // SUCCESS

                  window.localStorage['session'] = "";
                  $state.transitionTo('login');
             }
            })
            .error(function(response) { // IF THERE IS AN ERROR LOGOUT ANYWAY

                   $ionicLoading.hide();

                  window.localStorage['session'] = "";
                  $state.transitionTo('login');
            });
  }


  function signUp(email, password){

       $ionicLoading.show({
              template: 'Creating Account...'
          });

            $http.post("http://localhost:3000/signUp",
               { params: {
                           "email": email,
                           "password": password }
                           })
                 .success(function(response) {

                      $ionicLoading.hide();

                if ( response == "USER_EXISTS" ){
                      $ionicPopup.alert({
                       title: 'Username Taken',
                        template: 'Username taken, try another one.'
                      });
                }
               else{ // SUCCESS

                    window.localStorage['session'] = JSON.stringify(response);
                    $state.transitionTo('tab.dash');
               }
              })
              .error(function(response) {
                     $ionicLoading.hide();

                     $ionicPopup.alert({
                         title: 'Account',
                         template: 'Service unavailable, make sure you are online.'
                     });
              });
  }

  return {

    login: login,
    signUp: signUp,
    logout: logout

  };
});
