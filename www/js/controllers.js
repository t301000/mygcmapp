angular.module('starter.controllers', [])

.controller('NavCtrl', function($scope, $ionicSideMenuDelegate) {
	$scope.toggleLeft = function() {
    	$ionicSideMenuDelegate.toggleLeft();
    };
})

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
    	Chats.remove(chat);
  	};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
})

.controller('FriendsCtrl', function($scope, Friends) {
	$scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
	$scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope, MyDB, $cordovaToast) {
    $scope.settings = {};
    MyDB.getConfig().then(function(result){
      $scope.settings = result.rows.item(0);
    },function(error){
      alert('取得設定時發生錯誤');
    });
  	
    $scope.toggle = function(){
  		if($scope.settings.done){
        if($scope.settings.name && $scope.settings.email){
    			//啟用推播接收
    			$scope.$emit('regGCM');
        }else{
          $scope.settings.done = 0;
          $cordovaToast.showLongBottom("請先完成基本資料設定");
        }
  		} else {
  			//停用推播接收
  			$scope.$emit('unregGCM', $scope.settings.regid);
  		};
  	};
})

// 設定基本資料
.controller('SettingCtrl', function($scope, MyDB, $cordovaToast, $state) {
    $scope.settings = {};
    MyDB.getConfig().then(function(result){
      $scope.settings = result.rows.item(0);
    },function(error){
      alert('取得設定時發生錯誤');
    });

    $scope.updateNameEmail = function(settings){
      MyDB.updateNameEmail(settings).then(function(result){
        $cordovaToast.showLongBottom("基本資料設定完成");

        if($scope.settings.done){
          $scope.$emit('updateGCMData', settings);
        }

        $state.go('tab.account');
      },function(error){
        alert('更新基本資料時發生錯誤：' + error);
      });
    };
   
});
