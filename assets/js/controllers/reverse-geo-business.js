(function () {
  'use strict';

  angular
    .module('barikoi')
    .controller('ReverseGeoBusiness', ReverseGeoBusiness);

  ReverseGeoBusiness.$inject = ['$scope', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

  function ReverseGeoBusiness($scope, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {

    leafletData.getMap().then(function (map) {
      $timeout(function () {
        map.invalidateSize();
        //create bounds
      }, 500);
    });

    bsLoadingOverlayService.start({
      referenceId: 'first'
    });

    $scope.markers = []

    let addressPointsToMarkers = function (data) {


      // data.forEach(element => {
      //   let dd = element.split(',')

      //   if (dd[1] !== 0) {
      //     $scope.markers.push({

      //       lat: parseFloat(dd[2]),
      //       lng: parseFloat(dd[1]),
      //       layer: 'reverseGeoLog',
      //       message: dd[3]
      //     })
      //   }

      // });

      // let dd = elemdaent.split(',')



      return data.map(function (ap, i) {
        
        let dd = ap.split(',')

        // console.log(ap);
        
        if (dd[1] !== 0) {

            return {

              lat: parseFloat(dd[2]),
              lng: parseFloat(dd[1]),
              layer: 'reverseGeoLog',
              message: dd[3]
            }
            
        };
        
    });
      

      
    }

    var init = function () {

      
      const url = 'https://admin.barikoi.xyz/v1/get/reverse/geo/log/business'

      $http.get(url)
        .then(
          function (response) {

            bsLoadingOverlayService.stop({
              referenceId: 'first'
            });

            // success callback
            console.log('Success: ', response);

            $scope.markers = addressPointsToMarkers(response.data)

          },

          function (response) {
            // failure callback
            console.log('Error: ', response);
          }
        );

    };
    init();



    angular.extend($scope, {
      center: {
        lat: parseFloat(23.728783),
        lng: parseFloat(90.393791),
        zoom: 11,

      },

      controls: {
        draw: {}
      },
      layers: {
        baselayers: {


          barikoi: {
            name: 'barikoi',
            url: 'http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              attribution: 'Barikoi',
              maxZoom: 23
            },
          },

          bkoi: {
            name: 'Barikoi',
            type: 'wms',
            url: 'http://13.229.51.147:8080/geoserver/barikoi/wms?',
            visible: true,
            layerOptions: {
              layers: 'barikoi:bd_custom',
              format: 'image/png',
              // opacity: 0.25,
              attribution: 'bkoi',
              crs: L.CRS.EPSG3857,
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
          },

          googleTerrain: {
            name: 'Google Terrain',
            layerType: 'TERRAIN',
            type: 'google',
          },
          mapbox_light: {
            name: 'Mapbox Streets',
            url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
            type: 'xyz',
            layerOptions: {
              apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
              mapid: 'mapbox.streets',
              maxZoom: 23

            },
            layerParams: {
              showOnSelector: true
            }
          }

        },
        overlays: {
          draw: {
            name: 'draw',
            type: 'group',
            visible: true,
            layerParams: {
              showOnSelector: false
            }
          },
          reverseGeoLog: {
            name: "Reverse Geo Log Business",
            type: "markercluster",
            visible: true
          }
        }
      }
    });

  }

}());