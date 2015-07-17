'use strict';

angular.module('luna', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/blog', {templateUrl: 'templates/landing.html', controller: LandingCtrl}).
    when('/', {templateUrl: 'templates/landing.html', controller: LandingCtrl}).
    when('/home', {templateUrl: 'templates/home.html', controller: HomeCtrl}).
    when('/posts', {templateUrl: 'templates/all-posts.html', controller: AllPostsCtrl}).
    when('/blog/:post_id', {templateUrl: 'templates/single-post.html', controller: SinglePostCtrl}).
    when('/page/:page', {templateUrl: 'templates/landing.html', controller: LandingCtrl}).
    otherwise({redirectTo: '/'});
}]);

function LunaCtrl($scope, $http, $timeout, $location) {
  console.log('luna ctrl init');
  $scope.disable_animations = !CONFIG.ENABLE_ANIMATIONS;
  $scope.all_posts_loaded = false;
  $scope.blog = {
    title: CONFIG.BLOG_TITLE,
    nav_title: CONFIG.NAV_TITLE,
    use_disqus: CONFIG.USE_DISQUS
  }

  $http.get('content/posts.json').success(function(data) {
    $scope.posts = data;
    for (var i = 0; i < $scope.posts.length; i++) {
      $scope.posts[i].content = converter.makeHtml($scope.posts[i].content);
      var d = new Date($scope.posts[i].timestamp * 1000);
      $scope.posts[i].date = d.toString();
    }
    console.log('all posts loaded');

    $scope.all_posts_loaded = true;
    $timeout(function() {
      $scope.$broadcast('allPostsLoaded');
    }, 0);
  });

  //nav highlighting:
  $scope.getClass = function(path) {
    var cur_path = $location.path().substr(0, path.length);
    if (cur_path == path) {
        if($location.path().substr(0).length > 1 && path.length == 1 )
            return "";
        else
            return "active";
    } else {
        return "";
    }
}
}

function LandingCtrl($scope, $routeParams) {
  console.log('landing ctrl init');

  if ($scope.$parent.all_posts_loaded) {
    getPagePosts();
  } else {
    $scope.$on('allPostsLoaded', getPagePosts);
  }

  function getPagePosts() {
    $scope.current_page = $routeParams.page ? parseInt($routeParams.page) : 1;
    $scope.prev_page = $scope.current_page - 1 > 0 ? $scope.current_page - 1 : undefined;
    $scope.next_page = ($scope.current_page * CONFIG.NUM_POSTS_PER_PAGE) < $scope.posts.length ? $scope.current_page + 1 : undefined;
    var starting_index = Math.max($scope.current_page - 1, 0) * CONFIG.NUM_POSTS_PER_PAGE;
    $scope.current_page_posts = $scope.posts.slice(starting_index, starting_index + CONFIG.NUM_POSTS_PER_PAGE);
    $scope.orderProp = 'timestamp';
  }

  angular.element(document.getElementById('disqus_thread')).html('');
}

function AllPostsCtrl($scope) {
  $scope.orderProp = 'timestamp';

  angular.element(document.getElementById('disqus_thread')).html('');
}

function SinglePostCtrl($scope, $routeParams) {

  $scope.post_loaded = false;
  $scope.newer_post_id = undefined;
  $scope.older_post_id = undefined;

  if ($scope.$parent.all_posts_loaded) {
    console.log("if");
    loadSinglePost();
  } else {
    console.log("else");
    $scope.$on('allPostsLoaded', loadSinglePost);
  }

  function loadSinglePost() {
    $scope.current_post = findPostFromPostId($routeParams.post_id);


    console.log("loading single post");
    function findPostFromPostId(post_id) {
      for (var i = 0; i < $scope.$parent.posts.length; i++) {
        if ($scope.$parent.posts[i].post_id === post_id) {
          $scope.post_loaded = true;
          $scope.newer_post_id = i - 1 >= 0 ? $scope.$parent.posts[i-1].post_id : undefined;
          $scope.older_post_id = i + 1 <= $scope.$parent.posts.length - 1 ? $scope.$parent.posts[i+1].post_id : undefined;
          return $scope.$parent.posts[i];
        }
      }
      return ''; // TODO: Redirect to a 404 page
    }
  }

  function loadDisqus() {
    var currentPageId = $routeParams.post_id;

    window.disqus_shortname = CONFIG.DISQUS_SHORT_NAME;
    window.disqus_identifier = currentPageId;
    window.disqus_url = 'http://' + CONFIG.SITE_DOMAIN + '#/' + currentPageId;

    console.log(window.disqus_url);

    (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();

    angular.element(document.getElementById('disqus_thread')).html('');
  }

  if ($scope.$parent.blog.use_disqus) {
    loadDisqus();
  }
}

function HomeCtrl($scope, $http){
  // $.ajax({
  //   url: '/projects.json'
  // }).done(function(data) {
  //   console.log(data)
  //   $scope.projects = data
  //   for (var i = 0; i < $scope.projects.length; i++) {
  //     $scope.projects[i].description = converter.makeHtml($scope.projects[i].description);
  //     console.log('description: ');
  //     console.log($scope.projects[i].description);
  //   }
  //   console.log('all projects loaded');
  //   $scope.$apply();
  // });
var data=[
  {
  "title": "Market9",
  "description" : "Community to solve the last mile problem for grocery",
  "image" : "market9.png",
  "link" : "http://www.market9.sg/landing"
  },
  {
  "title": "Screengrab",
  "description" : "Web service to serve screenshot of pages.",
  "image" : "screengrab.png",
  "link" : "http://screengrab.herokuapp.com"
  },
  {
  "title": "2048 bot",
  "description" : "Stupid bot to loop your moves. [Read here](http://www.keang.be/blog/#/2048-bot).",
  "image" : "2048.png",
  "link" : "http://www.keang.be/2048"
  },
  {
  "title": "Follodota",
  "description" : "DotA professional match aggregator",
  "image" : "follodota.png",
  "link" : "https://play.google.com/store/apps/details?id=com.follodota&hl=en"
  },
  {
  "title": "Flappy Quiz",
  "description" : "Give out your quiz with flappy bird. [More here](http://www.keang.be/#/blog/joining-the-flappy-craze).",
  "image" : "flappy.png",
  "link" : "http://www.keang.be/flappy-quiz/"
  },
  {
  "title": "Brewnus",
  "description" : "Count the alcohol stash on campus!",
  "image" : "brewnus.png",
  "link" : "http://brewnus.herokuapp.com/"
  },
  {
  "title": "Staime",
  "description" : "Shopping loyalty in Cambodia",
  "image" : "staime.png",
  "link" : "http://www.staime-app.com/"
  },
  {
  "title": "Bounceball",
  "description" : "Unity powered game on [facebook](https://apps.facebook.com/unitybounceball) and [android](https://play.google.com/store/apps/details?id=com.kakada.gimmieunitydemo).",
  "image" : "bounceball.png",
  "link" : "https://apps.facebook.com/unitybounceball"
  },
  {
  "title": "English Repeat",
  "description" : "Android app to teach my parents English",
  "image" : "englishrepeat.png",
  "link" : "https://play.google.com/store/apps/details?id=com.kakadadroid.englishrepeat"
  },
  {
  "title": "Cocross",
  "description" : "a crossfit companion app",
  "image" : "cocross.png",
  "link" : "https://github.com/cocross/cocross_android"
  }
]
  $scope.projects = data
  for (var i = 0; i < $scope.projects.length; i++) {
    $scope.projects[i].description = converter.makeHtml($scope.projects[i].description);
    console.log('description: ');
    console.log($scope.projects[i].description);
  }

  $scope.currentTask = ["Freelance", "Find time to sleep", "Read"];
}
