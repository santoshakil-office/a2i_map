(function () {
  "use strict";
  var app = angular.module("barikoi", [
    "ui.router",
    "ui.bootstrap",
    "ngMaterial",
    "ngMessages",
    "ngStorage",
    "leaflet-directive",
    "angular-table",
    "angularjs-datetime-picker",
    "so.multiselect",
    "angular-inview",
    "chart.js",
    "bsLoadingOverlay",
    "ngImageCompress",
    "cellCursor",
    "pageslide-directive",
    "angularUtils.directives.dirPagination",
    "btorfs.multiselect",
    "ckeditor",
    'ngFileSaver'
  ]);

  //All Api urls.............................................................

  app.constant("urls", {
    POLYGON_THANA: "https://map.barikoi.xyz:8070/api/thana", 
  });

  //List Of All ui-routes...................................................

  app
    .config(function (
      $stateProvider,
      $urlRouterProvider,
      $httpProvider,
      ChartJsProvider,
      $mdDateLocaleProvider
    ) {
      ChartJsProvider.setOptions({
        colors: [
          "#46BFBD",
          "#DCDCDC",
          "#00ADF9",
          "#803690",
          "#FDB45C",
          "#949FB1",
          "#4D5360"
        ]
      });
      $urlRouterProvider.otherwise("/corona/map");
      $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format("YYYY-MM-DD");
      };

      $stateProvider

        .state("default", {
          url: "/",
          template: "<h1>Loading . .</h1>"
        })

        // .state("main", {
        //   abstract: true,
        //   // url: "/",
        //   templateUrl: "views/sidebar.html",
        //   controller: "MainController",
        //   authentication: true,
        //   userType: 1
        // })

        


        .state("dtool", {
          url: "/dtool/add/place",
          templateUrl: "views/dtool/add-place.html",
          controller: "DtollPlaceAdd",
          authentication: true,
          userType: 1
        })

        

        // Map View
        .state("polygon", {
          url: "/polygon",
          templateUrl: "views/maps/polygon.html",
          controller: "Polygon",
          authentication: true,
          userType: 1
        })

              


        // polygon thana
        .state("main", {
          url: "/corona/map", //ok
          templateUrl: "views/local-admin/polygonStd-thana.html",
          controller: "LocalPolygonStdThana",
          authentication: true,
          userType: 1
        });

      //Intercepts every http request and Response......................................................
      //
      $httpProvider.interceptors.push([
        "$q",
        "$location",
        "$localStorage",
        function ($q, $location, $localStorage) {
          return {
            request: function (config) {
              config.headers = config.headers || {};
              if (
                $localStorage.token &&
                config.url.startsWith("https://admin.barikoi.xyz")
              ) {
                config.headers.Authorization = "Bearer " + $localStorage.token; //sends authorization header for every subsequent request to server
              }
              if (config.url.indexOf("views") !== -1) {
                // console.log(config);
                //config.cache.remove();
                config.url = config.url + "?t=" + Date.now();
              }

              if (config.url.indexOf("views/assets/css") !== -1) {
                // console.log(config);
                config.url = config.url + "?t=" + Date.now();
              }
              return config;
            },
            responseError: function (response) {
              if (response.status === 401 || response.status === 403) {
                delete $localStorage.token;
                $location.path("/signin"); //redirecting route......................
              }
              return $q.reject(response);
            }
          };
        }
      ]);
    })
    .run(function (
      $rootScope,
      $state,
      $localStorage,
      $location,
      bsLoadingOverlayService,
      cellEditorFactory
    ) {
      bsLoadingOverlayService.setGlobalConfig({
        templateUrl: "views/loading-overlay-template.html"
      });

      console.log("RUNNING");
      $rootScope.ptypelabel = {
        select: "pType"
      };
      $rootScope.subtypelabel = {
        select: "subType"
      };

      cellEditorFactory["boolean"] = {
        // cell key event handler
        cellKey: function (event, options, td, cellCursor) {
          if (event.type == "keydown") {
            switch (event.which) {
              case 13:
              case 32:
                event.stopPropagation();
                options.setValue(!options.getValue());
                return true;
            }
          }
        },
        // editor open handler
        open: function (options, td, finish, cellEditor) {
          options.setValue(!options.getValue());
          finish();
        }
      };

      $rootScope.availableIcons = [ 'bank',
      'commercial',
      'construction',
      'education',
      'food',
      'fuel',
      'government',
      'healthcare',
      'hotel',
      'industry',
      'landmark',
      'office',
      'others',
      'recreation',
      'religious place',
      'residential',
      'shop',
      'transportation' ]

      // COL MANIPULATION

      $rootScope.columnLeftFull = true;
      $rootScope.columnLeftEight = false;
      $rootScope.columnRight = false;

      // toggle column
      $rootScope.updateColumnSize = function () {
        if ($rootScope.columnLeftFull) {
          $rootScope.columnLeftFull = false;
          $rootScope.columnLeftEight = true;
          $rootScope.columnRight = true;
        } else {
          $rootScope.columnLeftEight = false;
          $rootScope.columnRight = false;
          $rootScope.columnLeftFull = true;
        }
      };

      // col manipulation end


      // $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
      //   console.log($location.path())

      //   if (toState.name == "default") {
      //     if ($localStorage.userType == 1) {

      //       event.preventDefault();
      //       $state.go("main.dashboard");
      //       // $state.transitionTo(fromState.name);

      //     } else if ($localStorage.userType == 2) {
      //       event.preventDefault();
      //       $state.go("mapper.taskList");
      //       // $state.transitionTo(fromState.name);
      //     } else {
      //       $state.go("signin")
      //     }
      //   } else if ($localStorage.token == null) {

      //     if (toState.authentication) {
      //       event.preventDefault();
      //       $state.go("signin");
      //       // $state.transitionTo("signin");

      //     }

      //   } else if ($localStorage.token != null && toState.name == "signin" || toState.name == "signup") {

      //     if ($localStorage.userType == 1) {

      //       event.preventDefault();
      //       $state.go("main.dashboard");
      //       // $state.transitionTo(fromState.name);

      //     } else if ($localStorage.userType == 2) {
      //       event.preventDefault();
      //       $state.go("mapper.taskList");
      //       // $state.transitionTo(fromState.name);
      //     }

      //   } else if (toState.name == "signin" || toState.name == "signup") {
      //     if ($localStorage.userType == 1) {
      //       event.preventDefault();
      //       $state.go("main.dashboard");
      //       // $state.transitionTo(fromState.name);

      //     } else if ($localStorage.userType == 2) {
      //       event.preventDefault();
      //       $state.go('mapper.taskList');
      //       // $state.transitionTo(fromState.name);
      //     }
      //   }
      //   if ($localStorage.userType != toState.userType) {
      //     if ($localStorage.userType == 1) {
      //       event.preventDefault();
      //       $state.go("main.dashboard");
      //       // $state.transitionTo(fromState.name);

      //     } else if ($localStorage.userType == 2) {
      //       event.preventDefault();
      //       $state.go('mapper.taskList');
      //       // $state.transitionTo(fromState.name);
      //     }
      //   }
      // });
    });
})();