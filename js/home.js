'use strict';

function ProjectsCtrl($scope, $http){
  $http.get('/projects.json').success(function(data) {
    $scope.projects = data;
    for (var i = 0; i < $scope.projects.length; i++) {
      $scope.projects[i].description = converter.makeHtml($scope.projects[i].description);
      console.log('description: ');
      console.log($scope.projects[i].description);
  	}
    console.log('all projects loaded');
  });
}