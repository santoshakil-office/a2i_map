(function() {
  'use strict';

  angular
      .module('barikoi')
      .controller('ContributorGPX', ContributorGPX);

  ContributorGPX.$inject = ['$rootScope', '$scope', '$http', '$stateParams', '$window', '$location', '$timeout', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService', 'leafletData'];

  function ContributorGPX($rootScope, $scope, $http, $stateParams, $window, $location, $timeout, urls, Auth, DataTunnel, bsLoadingOverlayService, leafletData) {
      
  $scope.toggle = true;
      
  
  leafletData.getMap().then(function (map) {
    $timeout(function () {
        map.invalidateSize();
        //create bounds
    }, 500);
});

   
     var addressPointsToMarkers = function(points) {
        console.log(points)
            return points.map(function(ap) {
               var icon = './assets/img/reddot.png';
              
              return {
                id : ap.id,
                code: ap.uCode,
                lat : parseFloat(ap.lat),
                lng : parseFloat(ap.lon),
                focus : true,
                message : ap.created_at,
                icon : {
                  iconUrl: icon,
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
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
  events: {
      map: {
          enable: ['moveend', 'popupopen'],
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
                    //       type: 'google'
                    //   },

                      mapbox_light: {
                          name: 'Mapbox Streets',
                          url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                          type: 'xyz',
                          layerOptions: {
                              apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                              mapid: 'mapbox.streets',
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


  $http.get(urls.CONTRIBUTER_GPX+$stateParams.id)
    .success(function(data) {
          $scope.markers = addressPointsToMarkers(data);
         bsLoadingOverlayService.stop({
                      referenceId: 'first'
                  });
      })
      .error(function() {
         
         bsLoadingOverlayService.stop({
                      referenceId: 'first'
                  });
                 
      })

   

 

  $scope.openSlide = function() {
    $scope.toggle = !$scope.toggle;
  };




      

}

}());