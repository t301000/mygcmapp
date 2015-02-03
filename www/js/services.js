angular.module('starter.services', [])
.factory('MyDB', function($cordovaSQLite, $q){
  var self = this;
  
  self.db = null;

  // 初始化資料庫
  self.init = function(){
    self.db = $cordovaSQLite.openDB({ name: "mygcmdb.db"});
    var sql = "CREATE TABLE IF NOT EXISTS config (name TEXT, email TEXT, regid TEXT, done INTEGER)";
    $cordovaSQLite.execute(self.db, sql).then(function(result){
      console.log("config table ok");
      // 取得 config 紀錄，若資料筆數為 0 則新增一筆預設值
      self.getConfig().then(function(result){
        if(result.rows.length === 0){
          // 新增預設 config 紀錄
          $cordovaSQLite.execute(self.db, "INSERT INTO config (name , email, regid, done) VALUES (null, null, null, 0)")
          .then(function(result){
             console.log("Add default config :" + result);
          });
        }

      });
      
    },function(error){
      alert('建立config資料表時發生錯誤：' + error);
    });

    sql = "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, sender TEXT, readed INTEGER DEFAULT 0)";
    $cordovaSQLite.execute(self.db, sql).then(function(result){
      // 成功
      console.log("messages table ok");
    },function(error){
      alert('建立messages資料表時發生錯誤：' + error);
    });

  };

  // 取得 config
  self.getConfig = function(){
    var q = $q.defer();
    var sql = "SELECT * FROM config";
    $cordovaSQLite.execute(self.db, sql).then(function(result){
      q.resolve(result);
    },function(error){
      q.reject(error);
    });

    return q.promise;

  };

  // 更新 config: name and email
  self.updateNameEmail = function(data){
    var q = $q.defer();
    var sql = "UPDATE config SET name='" + data.name + "',email='" + data.email + "'" ;

    $cordovaSQLite.execute(self.db, sql).then(function(result){
      q.resolve(result);
    },function(error){
      q.reject(error);
    });

    return q.promise;
  };

  // 更新 config: regid
  self.updateRegID = function(regid){
    var q = $q.defer();
    var sql = "UPDATE config SET regid='" + regid + "', done=1" ;

    $cordovaSQLite.execute(self.db, sql).then(function(result){
      q.resolve(result);
    },function(error){
      q.reject(error);
    });

    return q.promise;
  };

  // 更新 config: done
  // done = 1 為向　GCM php server 儲存成功
  self.updateDone = function(isDone){
    var q = $q.defer();
    var sql = "UPDATE config SET done=" + isDone;

    $cordovaSQLite.execute(self.db, sql).then(function(result){
      q.resolve(result);
    },function(error){
      q.reject(error);
    });

    return q.promise;
  };

  return self;
})

.factory('GcmServerAPI', function(GCM_PHP_SERVER, $http, $q){
  var self = this;
  // 向 GCM php server 註冊
  self.register = function(regdata){
    var q = $q.defer();

    $http.post( GCM_PHP_SERVER.url + '/api/gcm', regdata)
    .success(function(result){
      if(result.status === 'success'){
        q.resolve(result.id);
      }else if(result.status === 'error'){
        q.reject(result.msg);
      }
    })
    .error(function(){
      q.reject('向 GCM php server 註冊時發生錯誤，請稍候再試');
    });
    
    return q.promise;
  };

  // 向 GCM php server 撤銷註冊
  self.unregister = function(regid){
    var q = $q.defer();

    $http.post( GCM_PHP_SERVER.url + '/api/gcm/delete',{regid: regid})
    .success(function(result){
      if(result.status === 'success'){
        q.resolve();
      }else if(result.status === 'error'){
        q.reject(result.msg);
      }
    })
    .error(function(){
      q.reject("與　Server　連線失敗，請稍候再試");
    });

    return q.promise;
  };

  // 更新　server 紀錄之 name and email
  self.updateGCMData = function(data){
    var q = $q.defer();
    //console.log('update data ==> '+ angular.toJson(data,true));
    $http.post( GCM_PHP_SERVER.url + '/api/gcm/update', data)
    .success(function(result){
      if(result.status === 'success'){
        q.resolve();
      }else if(result.status === 'error'){
        q.reject(result.msg);
      }
    })
    .error(function(error){
      q.reject("與　Server　連線失敗，請稍候再試");
    });

    return q.promise;
  };

  return self;
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  }
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});
