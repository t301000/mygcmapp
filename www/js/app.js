// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])
// 設定物件
// senderID為專案編號
.constant('ANDROID_CONFIG', {"senderID": "337307374158"})
// GCM php server， url 結尾沒有 /
.constant('GCM_PHP_SERVER', {"url": "http://192.168.1.115/gcm-php-server"})

.run(function($ionicPlatform, $cordovaPush, $rootScope, $cordovaToast, ANDROID_CONFIG, MyDB, GcmServerAPI) {

  	$ionicPlatform.ready(function() {
    	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    	// for form inputs)
    	if (window.cordova && window.cordova.plugins.Keyboard) {
      		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    	}
    	if (window.StatusBar) {
      		// org.apache.cordova.statusbar required
      		StatusBar.styleDefault();
    	}
    	// 初始化資料庫
    	MyDB.init();
      
    	// 監聽：向GCM註冊
    	$rootScope.$on('regGCM', function(){
    		$cordovaPush.register(ANDROID_CONFIG)
    			.then(function(result) {
    		    	// Success
    			}, function(err) {
    		    	// Error
    			});
    	});

    	/*// 監聽：向GCM註銷
    	$rootScope.$on('unregGCM', function(){
    		$cordovaPush.unregister(ANDROID_CONFIG)
    			.then(function(result) {
    		    	// Success
              
              // 向 GCM php server 註銷 regid
              GcmServerAPI.unregister().then(function(result){
                // 成功，更新資料庫
                MyDB.updateDone(0).then();
              },function(error){

              });
    		    	MyDB.updateConfig({acceptNotify: 0}).then(function(result){
                $cordovaToast.showLongBottom("推播已關閉");
              },function(error){
                alert('關閉推播：更新資料庫時發生錯誤');
              });
    			}, function(err) {
    		    	// Error
    		    	alert('關閉訊息推播時發生錯誤：' + err);
    			});
    	});*/

      // 監聽：向GCM註銷
      $rootScope.$on('unregGCM', function(event, regid){
        // 向 GCM php server 註銷 regid
        console.log('regid to unregister ==> '+regid);
        
        GcmServerAPI.unregister(regid).then(function(result){
          // 成功，更新資料庫
          MyDB.updateDone(0).then(function(){
            $cordovaToast.showLongBottom("已取消註冊");
          },function(error){
            alert(error);
          });
        },function(error){
          alert(error);
        });
        
      });

      // 監聽：更新GCM php server 紀錄之name and email
      $rootScope.$on('updateGCMData', function(event, data){
        //console.log('update data ==> '+ angular.toJson(data,true));

        GcmServerAPI.updateGCMData(data).then(function(result){
          $cordovaToast.showLongBottom("註冊資料已更新");
        },function(error){
          alert(error);
        });
        
      });

    	// 監聽：收到推播訊息
    	$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
    	    switch(notification.event) {
    	        case 'registered':
    	          	if (notification.regid.length > 0 ) {
                    // 將regid與基本資料送至server儲存
                    // 完成後顯示提示訊息
                    var config = null;
                    MyDB.getConfig().then(function(result){
                      var config = result.rows.item(0);
                      GcmServerAPI.register({
                        regid: notification.regid,
                        name: config.name,
                        email: config.email
                      }).then(function(id){
                        // server 儲存成功 
                        MyDB.updateRegID(notification.regid).then(function(result){
                          $cordovaToast.showLongBottom("已向伺服器註冊成功");
                        },function(error){
                          alert('更新資料庫時發生錯誤（001）');
                        });
                      },function(error){
                        // server 儲存失敗
                        alert("向伺服器註冊失敗：" + error);
                      });
                    });
    	          	}
    	          	break;

    	        case 'message':
    	          	// this is the actual push notification. its format depends on the data model from the push server
    	          	alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
    	          	break;

    	        case 'error':
    	          	alert('GCM error = ' + notification.msg);
    	          	break;

    	        default:
    	          	alert('An unknown GCM event has occurred');
    	          	break;
    	    }
    	});

  	});
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })
    .state('tab.friend-detail', {
      url: '/friend/:friendId',
      views: {
        'tab-friends': {
          templateUrl: 'templates/friend-detail.html',
          controller: 'FriendDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    cache: false,
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.account-setting', {
    url: '/setting',
    views: {
      'tab-account': {
        templateUrl: 'templates/account-setting.html',
        controller: 'SettingCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
