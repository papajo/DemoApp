angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, IonicLogin) {

  $scope.$on('$ionicView.enter', function(e) {
      $scope.session = JSON.parse( window.localStorage['session']); // read the session information
  });

   $scope.logout = function(){
       IonicLogin.logout($scope.session.email);
  };
})

.controller('ResetPassword', function($scope, IonicLogin, $ionicLoading, $rootScope, $http, $ionicPopup, $state) {

  $scope.$on('$ionicView.enter', function(e) {
      $scope.data = {} ;
      $scope.data.email = $rootScope.email;
      $scope.mailNewCode();
  });

  $scope.mailNewCode = function(){

      if (  $scope.data.email == null ||  $scope.data.email == ""){
          $ionicPopup.alert({
                       title: 'Email',
                       template: 'Invalid email address.' });

          return ;
      }

      $rootScope.email = $scope.data.email;

      $http.post("http://localhost:3000/resetpassword",
            { params: { action: "generateResetCode", email: $scope.data.email}})
              .success(function(response) {
              if ( response == "error" ){
                  $ionicPopup.alert({
                       title: 'Ouch',
                       template: 'Looks like we messed up somewhere.' });
              }
              else if (response == "user_not_found"){
                  $ionicPopup.alert({
                       title: 'User not found',
                       template: 'Could not find the user with that email.' });
              }
              else{
                  $ionicPopup.alert({
                       title: 'Reset Code Sent',
                       template: 'We have sent a new reset code to your email address. Enter it in the field below.' });
              }
            })
            .error(function(response) {
                $ionicPopup.alert({
                       title: 'Ouch',
                       template: 'Looks like we messed up somewhere.' });
        });
  }

  $scope.saveNewPassword = function(){

      $rootScope.email = $scope.data.email;

      $http.post("http://localhost:3000/resetpassword",
            { params: { action: "setNewPassword", email: $scope.data.email,
                        token: $scope.data.token, password: $scope.data.password} })
              .success(function(response) {

                if ( response == "error" ){
                   $ionicPopup.alert({
                       title: 'Ouch',
                       template: 'Looks like we messed up somewhere.' });
                }
                else if (response == "user_not_found"){
                    $ionicPopup.alert({
                       title: 'User not found',
                       template: 'Could not find the user with that email.' });
                }
                else if (response == "new_password_saved"){
                    $ionicPopup.alert({
                       title: 'New Password Saved',
                       template: 'Your new password was saved succesfully!' });

                    $state.go('login');
                }
                else if ( response == "invalid_token"){
                     $ionicPopup.alert({
                       title: 'Invalid Reset Code',
                       template: 'The reset code you entered is invalid.' });
                }
            })
            .error(function(response) {
                 $ionicPopup.alert({
                       title: 'Ouch',
                       template: 'Looks like we messed up somewhere.' });
        });
  }

})

.controller('IonicLogin', function($scope, IonicLogin, $ionicLoading, $state, $rootScope, $ionicPopup) {

   $scope.$on('$ionicView.enter', function(e) {
      $scope.data = {} ;
      $scope.data.email = $rootScope.email;
  });

  $scope.logout = function(){
       IonicLogin.logout();
  }

  $scope.login = function(){
       IonicLogin.login($scope.data.email, $scope.data.password);
  }

  $scope.signUp = function(){
      IonicLogin.signUp($scope.data.email, $scope.data.password);
  }

  $scope.resetPassword = function(){
      $rootScope.email = $scope.data.email;

    //  alert($scope.loginForm.emailInput.$valid);

      if ( $scope.data.email != null && $scope.data.email != "" ){
           $state.go('resetpassword');
      }
      else{
          $ionicPopup.alert({
             title: 'Invalid Email',
             template: 'Please enter a valid email address first.' });
      }
  }
})

.controller('SplashController', function ($scope, $state, $window, $http){

    $scope.$on("$ionicView.enter", function(event) {
          $scope.checkSession();
    });

  $scope.checkSession = function () {

        if ( window.localStorage['session'] != null &&  window.localStorage['session'] != undefined )
        {
            var sesh = JSON.parse(window.localStorage['session']) ;

              $http.post("http://localhost:3000/checkSession",
                { params: { "session": JSON.stringify(sesh)}})
                  .success(function(response) {
                   if ( response == "error" || response == "LOGIN_FAIL" ){
                        $state.go('login');
                   }
                   else{
                       $state.go('tab.dash');
                  }
                })
                .error(function(response) {
                  $state.go('login');
            });
        }
        else{
           $state.go('login');
        }
     }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, IonicLogin) {

})

.controller('AccountCtrl', function($scope) {

});
