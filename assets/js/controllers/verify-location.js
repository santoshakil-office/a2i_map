(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('VerifyLocation', VerifyLocation);

    VerifyLocation.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$timeout', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function VerifyLocation($rootScope, $scope, $http, $stateParams, $window, $location, $timeout, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        var id, info;
         var minLength = 1;
    $scope.loading = false;
     $scope.toggle = true;

     leafletData.getMap().then(function(map) {
              $timeout(function() {
                map.invalidateSize();
                //create bounds
              }, 1000);
            });
         
       var addressPointsToMarkers = function(points) {
              return points.map(function(ap) {
                console.log(ap)
                var icon = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';
                // if(isNaN(ap.latitude) || isNaN(ap.longitude)) {
                //     console.log(ap.latitude, ap.longitude);
                //     ap.latitude = 23.2433323;
                //     ap.longitude = 90.02433323;
                // };
                // try {
                //   info = ap.images[0].imageLink;
                // }catch(e){
                //   info = 'image'
                // };
                             
                 
                return {
                  id : ap.id,
                  lat : parseFloat(ap.latitude),
                  lng : parseFloat(ap.longitude),
                  Address : ap.Address,
                  subtype : ap.subType,
                  uCode : ap.uCode,
                  focus : false,
                  message :"<div ng-include src=\"'views/marker-popup.html'\"></div>",
                  draggable: true,
                  icon : {
                    iconUrl: icon,
                    iconSize: [28, 28], // size of the icon
                  }
                };
              });
     };


       
    angular.extend($scope, {
      center: {
          lat: 23.728783,
          lng: 90.393791,
          zoom: 12,

        },

        markers: {

        },

    events: {
        map: {
            enable: ['dblclick', 'moveend', 'popupopen'],
            logic: 'emit'
        },
        marker: {
           enable: [ 'click', 'dblclick', 'dragend' ],
            logic: 'emit'
        }
    },
      layers: {
                    baselayers: {
                      // googleTerrain: {
                      //       name: 'Google Terrain',
                      //       layerType: 'TERRAIN',
                      //       type: 'google',
                      //       layerOptions: {
                      //           attribution: 'barikoi',
                      //           maxZoom: 21
                      //       }

                      //   },
                        mapbox_light: {
                            name: 'Mapbox Streets',
                            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                            type: 'xyz',
                            layerOptions: {
                                apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                                mapid: 'mapbox.streets',
                                attribution: 'barikoi',
                                maxZoom: 23
                            }
                        },
                        osm: {
                            name: 'OpenStreetMap',
                            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                maxZoom: 23
                            },
                        }
                    }
                }
            });


    // $scope.$on("leafletDirectiveMarker.dblclick", function(event, args){
    //     $window.open('https://dev.barikoi.com/#/code/' + args.model.code, 'BariKoi?', 'width=800,height=700');
    // });

    // $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
    //       var data = {
    //         'latitude' : args.model.lat,
    //         'longitude' : args.model.lng,
    //     }

    //     swal({  
    //             title: "Are you sure?",   
    //             // text: "You will not be able to recover this imaginary file!",   
    //             type: "warning",   
    //             showCancelButton: true,   
    //             confirmButtonColor: "#DD6B55",   
    //             confirmButtonText: "Yes, update marker position!",   
    //             closeOnConfirm: false }, 
    //             function(){   
    //                 Auth.updateSomething2(urls.DROP_MARKER+args.model.id+"?longitude="+args.model.lng+"&latitude="+args.model.lat, function(res) {
    //             swal("Done", "marker position has been updated");
    //         },function() {
    //             swal("Error")
    //         }) 

    //             });

    // });

    //  $scope.$on("leafletDirectiveMap.dblclick", function(event, args){
    //     console.log(args);
    //       $scope.markers = [];
    //      bsLoadingOverlayService.start({
    //             referenceId: 'first'
    //     });
    //        var leafEvent = args.leafletEvent;

    //     var latitude = leafEvent.latlng.lat;
    //     var longitude = leafEvent.latlng.lng
    //     args.model.center.lat = leafEvent.latlng.lat
    //     args.model.center.lng = leafEvent.latlng.lng
    //     args.model.center.zoom = 13

    //      $http.get(urls.NEARBY_LOCATION, {params:{"longitude": longitude, "latitude": latitude}})
    //           .success(function(res) {
    //             $timeout(function(){
    //                 bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //         }, 2000);
    //                 $scope.data = res;
    //                 $scope.markers = addressPointsToMarkers(res.Places);
    //                 $scope.markers.push({
    //                   lat: latitude,
    //                   lng: longitude,
    //                   message : res['Your are Currently at or nearby'][0].Address,
    //                 });
                  
    //           })
    //           .error(function(err) {
    //                 $rootScope.error = 'Failed to fetch data';
    //         $timeout(function(){
    //                 bsLoadingOverlayService.stop({
    //                     referenceId: 'first'
    //                 });
    //                 swal($rootScope.error);
    //                    $scope.markers.push({
    //                   lat: latitude,
    //                   lng: longitude
    //                 });
    //             }, 2000);
    //       });
    // });


    // $scope.set_subtype = function(subtype) {
    //     console.log(subtype);
    //     Auth.get_with_params(urls.PLACE_BY_TYPE+'subType='+subtype.subtype, function(res) {
    //          $scope.total = res.Total;
    //          $scope.markers = addressPointsToMarkers(res.Places);
    //          swal("Successfull", "Place Loaded");
    //     },function() {
    //         swal("Unsuccessfull", " ");
    //     });
    // };

    $scope.openSlide = function() {
      $scope.toggle = !$scope.toggle;
    };
   
   $scope.$on("leafletDirectiveMarker.click", function(event, args) {
            DataTunnel.set_data(args.model)
        });

   // $scope.$on("leafletDirectiveMarker.click", function(event, args) {
   //          var newHash = 'elm' + args.model.id;
   //          if ($location.hash() !== newHash) {
   //              $location.hash('elm' + args.model.id);
   //          } else {
   //              $anchorScroll();
   //          }
   //      });

   //      $scope.$on("leafletDirectiveMarker.mouseover", function(event, args) {
   //          $rootScope.mhover[args.model.id] = true;
   //          $rootScope.mout[args.model.id] = false;
   //          var newHash = 'elm' + args.model.id;
   //          if ($location.hash() !== newHash) {
   //              $location.hash('elm' + args.model.id);
   //          } else {
   //              $anchorScroll();
   //          }
   //      });

   //      $scope.$on("leafletDirectiveMarker.mouseout", function(event, args) {

   //          $rootScope.mhover[args.model.id] = false;
   //          $rootScope.mout[args.model.id] = true;
   //          var newHash = 'elm' + args.model.id;
   //          if ($location.hash() !== newHash) {
   //              $location.hash('elm' + args.model.id);
   //          } else {
   //              $anchorScroll();
   //          }
   //      });


        function csvToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }

    //$scope.markers = []
    $scope.showOverlay = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            var temp = []

            var order_list = csvToArray($scope.fileContent, ',');
            for(var ea in order_list) {
                           
                // Send Data Through Auth Service.......
                // Auth Service IS Responsible for Handling Http Request and Authentication......................
                  Auth.getUsers(order_list[ea][0]).then(function(data){
                    $scope.loading = false;
                        //$scope.markers = addressPointsToMarker(data.places);
                        if (Array.isArray(data.places)) {
                           

                        temp.push(data.places);
                          // $scope.markers = addressPointsToMarkers(temp.flat()); 
                        }

                  }, function(status){
                    console.log('err')
                  });
                  temp.flat(); 
                  temp.pop();

            } 

             $scope.markers = addressPointsToMarkers(temp.flat()); 
            bsLoadingOverlayService.stop({
                                    referenceId: 'first'
                                });
           
        };
    
  }

}());