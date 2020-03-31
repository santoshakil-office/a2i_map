(function() {
  'use strict';

  angular
      .module('barikoi')
      .controller('LocalPolygonSearch', LocalPolygonSearch);
  LocalPolygonSearch.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$anchorScroll', '$location', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

  function LocalPolygonSearch($scope, $modal, $http, $stateParams, $window, $anchorScroll, $location, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
      
     

        var init = function() {
         Auth.getlocations(urls.POLYGON, function(res) {
          $scope.areas = res.area;
          var coordinates = [];
          var temp = []
          $scope.areas.map(function(area) {
            var polyjson = JSON.parse(area['ST_AsGeoJSON(area)']);
            //console.log(polyjson.coordinates[0]);
            temp.push(polyjson.coordinates[0])
            // console.log(array.concat(polyjson.coordinates[0]));
          });
          coordinates = temp;
          console.log(coordinates);
//             var array1 = [[1, 2, 3],[4, 5, 6]];
// var array2 = [[7, 8, 9],[10, 11, 12]]

// console.log(array1.concat(array2));

          $scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});
           
      },
       function() {
          
      });
          Auth.getlocations(urls.GET_SUBTYPES, function(res) {
           $scope.subcategories = res;
           $scope.subcategories.push({subtype:"all"});
          //console.log(res);
      },
       function() {
          
      });
         
      };
      init();

      var id;
      var info;
     var addressPointsToMarkers = function(points) {
            return points.map(function(ap) {
              if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                  console.log(ap.latitude, ap.longitude);
                  ap.latitude = 23.2433323;
                  ap.longitude = 90.02433323;
              };
                info = '<div><p>Address: '+ap.Address+'<br></p><p>Subtype: '+ap.subType+'<br></p><p>Code: '+ap.uCode+'</p></div>'; 
              return {
                id : ap.id,
                lat : parseFloat(ap.latitude),
                lng : parseFloat(ap.longitude),
                focus : false,
                Address : ap.Address,
                subtype : ap.subType,
                uCode : ap.uCode,
                userID: ap.user_id,
                updated_at: ap.updated_at,
                message :"<div ng-include src=\"'views/marker-popup.html'\"></div>",
                draggable: true,
                icon : {
                  iconUrl: './assets/img/'+ap.pType+'.png',
                  iconSize: [20, 20], // size of the icon
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
       controls: {
                  draw: {}
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
                     //      name: 'Google Terrain',
                     //      layerType: 'TERRAIN',
                     //      type: 'google',
                     //      layerOptions: {
                            
                     //          attribution: 'barikoi',
                     //          maxZoom: 23
                     //      }
                     //  },

                    mapbox_light: {
                          name: 'Mapbox Streets',
                          url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                          type: 'xyz',
                          layerOptions: {
                              apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                              mapid: 'mapbox.streets',
                              attribution: 'barikoi',
                              maxZoom: 23
                          },
                          layerParams: {
                              showOnSelector: true
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
                  },
                  overlays: {
                      draw: {
                          name: 'draw',
                          type: 'group',
                          visible: true,
                          layerParams: {
                              showOnSelector: false
                          }
                      }
                  }
              }
          });

          leafletData.getMap().then(function(map) {
             leafletData.getLayers().then(function(baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function (e) {
                  var layer = e.layer;
                  drawnItems.addLayer(layer);
                   //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                    var array = [];
                   layer.toGeoJSON().geometry.coordinates[0].map(function(ary) {
                    
                     array.push(ary.join(' '));
                   });
                   var coordinates = array.reduce(
                    ( accumulator, currentValue ) => accumulator.concat(currentValue),
                    []
                  );
                  
                   
                    console.log(coordinates.toString())
                    Auth.get_with_params(urls.POLYGON_CUSTOM+'area='+ coordinates.toString(), function(res) {
                      $scope.total = res.Total;
                      $scope.markers = addressPointsToMarkers(res.places);

                  },function() {
                      swal("Error")
                  }) 
                   
                });
             });
         });
 

  


  $scope.set_area = function(area) {
    console.log(area);
    var polyjson = JSON.parse(area['ST_AsGeoJSON(area)']);
    console.log(polyjson);
    $scope.id = JSON.parse(area['id']);
   
    angular.extend($scope, {
      center: {
        lat: polyjson.coordinates[0][0][1],
        lng: polyjson.coordinates[0][0][0],
        zoom: 13,

      },
      controls: {
                  draw: {}
              },

              layers: {
                  baselayers: {
                     // googleTerrain: {
                     //      name: 'Google Terrain',
                     //      layerType: 'TERRAIN',
                     //      type: 'google'
                     //  },

                    mapbox_light: {
                          name: 'Mapbox Streets',
                          url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                          type: 'xyz',
                          layerOptions: {
                              apikey: 'pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w',
                              mapid: 'mapbox.streets',
                              maxZoom:23
                          },
                          layerParams: {
                              showOnSelector: true
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
                  },
                  overlays: {
                      draw: {
                          name: 'draw',
                          type: 'group',
                          visible: true,
                          layerParams: {
                              showOnSelector: false
                          }
                      }
                  }
              },
              geojson : {
                  data: {
                    "type": "FeatureCollection",
                    "features": [
                      {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                          "type": "Polygon",
                          "coordinates": polyjson.coordinates
                        }
                      }
                    ]
                  },
                  style: {
                     
                          weight: 2,
                          opacity: 1,
                          color: 'red',
                          dashArray: '3',
                          fillOpacity: 0
                  }
              },


          });
      $scope.markers = {};
  };

  $scope.set_subType = function(area, subtype) {
      bsLoadingOverlayService.start({
              referenceId: 'first'
      });
      if (area==undefined){ area = '';}
      // if (subtype==undefined) {subtype = '';}

      Auth.get_with_params(urls.PLACE_BY_AREA+'area'+"="+area+'&subType'+"="+subtype, function(res) {
              bsLoadingOverlayService.stop({
                      referenceId: 'first'
                  });
                   $scope.total = res.Total;
                   $scope.markers = addressPointsToMarkers(res.places);
      },function() {
          
         bsLoadingOverlayService.stop({
                      referenceId: 'first'
                  });
                
      });
  };

$scope.$on("leafletDirectiveMarker.click", function(event, args) {
          DataTunnel.set_data(args.model)
      });

$scope.openSlide = function() {
    $scope.toggle = !$scope.toggle;
  };

  // $scope.$on("leafletDirectiveMarker.click", function(event, args) {
  //         var newHash = 'elm' + args.model.id;
  //         if ($location.hash() !== newHash) {
  //             $location.hash('elm' + args.model.id);
  //         } else {
  //             $anchorScroll();
  //         }
  //     });

      // $scope.$on("leafletDirectiveMarker.mouseover", function(event, args) {
      //     $rootScope.mhover[args.model.id] = true;
      //     $rootScope.mout[args.model.id] = false;
      //     var newHash = 'elm' + args.model.id;
      //     if ($location.hash() !== newHash) {
      //         $location.hash('elm' + args.model.id);
      //     } else {
      //         $anchorScroll();
      //     }
      // });

      // $scope.$on("leafletDirectiveMarker.mouseout", function(event, args) {

      //     $rootScope.mhover[args.model.id] = false;
      //     $rootScope.mout[args.model.id] = true;
      //     var newHash = 'elm' + args.model.id;
      //     if ($location.hash() !== newHash) {
      //         $location.hash('elm' + args.model.id);
      //     } else {
      //         $anchorScroll();
      //     }
      // });


    $scope.$watch("mapView", function(value) {
      console.log($scope.mapView);
      if (value === true) {
          leafletData.getMap().then(function(map) {
            $timeout(function() {
              map.invalidateSize();
              //create bounds
              leafletData.getMap().then(function (map) {
                  if ($scope.mapBounds.length < 1){$scope.mapBounds.push([$scope.location.coords.longitude,$scope.location.coords.latitude])}
                  var bbox = L.latLngBounds($scope.mapBounds);
                  $scope.maxBounds.southWest = bbox.getSouthWest();
                  $scope.maxBounds.northEast = bbox.getNorthEast();
                  map.fitBounds(bbox);
              });
            }, 300);
          });
      }
  });

    $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
        var data = {
          'latitude' : args.model.lat,
          'longitude' : args.model.lng,
      }

      swal({  
              title: "Are you sure?",   
              // text: "You will not be able to recover this imaginary file!",   
              type: "warning",   
              showCancelButton: true,   
              confirmButtonColor: "#DD6B55",   
              confirmButtonText: "Yes, update marker position!",   
              closeOnConfirm: false }, 
              function(){   
                  Auth.updateSomething2(urls.DROP_MARKER+args.model.id+"?longitude="+args.model.lng+"&latitude="+args.model.lat, function(res) {
              swal("Done", "marker position has been updated");
          },function() {
              swal("Error")
          }) 

              });

  });

    $scope.changeCenter = function(marker) {
              $scope.center.lat = marker.lat;
              $scope.center.lng = marker.lng;
              DataTunnel.set_data(marker);
              marker.focus = true;
          };
  
}

}());