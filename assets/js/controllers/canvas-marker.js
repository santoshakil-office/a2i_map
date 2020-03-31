(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('CanvasMarker', CanvasMarker)
        .directive('popup', function(DataTunnel) {
            return {
                restrict: 'A',
                templateUrl: 'views/marker-popup-com.html',
                scope: {},
               
            }
        });

    CanvasMarker.$inject = ['$rootScope','$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', '$compile', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function CanvasMarker($scope, $modal, $http, $stateParams, $window, $location, $timeout, $compile, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
      $scope.limit = 10;
        $scope.coordinates;
        var ciLayer;

        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                $scope.map = map;
                //create bounds
            }, 1000);

        });


        var init = function() {
            Auth.getlocations(urls.POLYGON, function(res) {
                    $scope.areas = res.area;

                },
                function() {

                });
            Auth.getlocations(urls.GET_SUBTYPES, function(res) {
                    $scope.subcategories = res;
                    $scope.subcategories.push({ subtype: "all" });
                    //console.log(res);
                },
                function() {

                });

        };
        init();

       


        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

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
                    }
                }
            }
        });

        leafletData.getMap().then(function(map) {
            leafletData.getLayers().then(function(baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function(e) {
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                    var array = [];
                    layer.toGeoJSON().geometry.coordinates[0].map(function(ary) {

                        array.push(ary.join(' '));
                    });
                    var coordinates = array.reduce(
                        (accumulator, currentValue) => accumulator.concat(currentValue),
                        []
                    );
                    // ciLayer = null;
                    ciLayer = new L.canvasIconLayer({});

                    $scope.map.addLayer(ciLayer);
// $scope.map.addLayer(markersLayer);
$scope.map.addLayer(ciLayer);

  var controlSearch = new L.Control.Search({
    position:'topleft',    
    layer: ciLayer,
    initial: false,
    zoom: 11,
    marker: false,
    textPlaceholder: 'search...'
  });

  map.addControl(controlSearch); 
  controlSearch.on('search:collapsed', function(e) {
      map.setView([23.101516, 90.313446], 13);
  })

                    ciLayer.addOnClickListener(function(e, data) {
                        console.log(data)
                        // ciLayer.removeMarker(data[0].data, true);
                        var newScope = $scope.$new();
                        DataTunnel.set_data(data[0].data.options);
                        var te = $compile('<div popup></div>')(newScope);
                        data[0].data.bindPopup(te[0]);
                    });
                    // ciLayer.addOnHoverListener(function (e,data) {console.log(data[0].data._leaflet_id)});

                    Auth.get_with_params(urls.POLYGON_CUSTOM + 'area=' + coordinates.toString(), function(res) {
                        $scope.total = res.Total;

                        var icon  = L.icon({
                            iconUrl: './assets/img/type/default.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 35],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                          })
                        var markers = [];
                        $scope.mark = [];
                        for (var i = 0; i < res.places.length - 1; i++) {

                            if( $rootScope.availableIcons.includes(ap.pType.split(',')[0])) {
                                icon = './assets/img/type/' + res.places[i].pType.split(',')[0].toLowerCase() + '.png';
                            }
                            // icon = L.icon({
                            //     iconUrl: icon,
                            //     //iconUrl: './assets/img/type/residential.png',
                            //     iconSize: [20, 18],
                            //     iconAnchor: [10, 9]
                            // });

                            if( ap.subType == 'WATER ATM') {
                                icon.iconUrl = './assets/img/type/water-atm.png'
                                icon.iconSize =  [30, 38]
                            }
                            else if( $rootScope.availableIcons.includes(ap.pType.split(',')[0])) {
                                icon = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';
                            }
                            
                            var marker = L.marker([res.places[i].latitude, res.places[i].longitude], {
                                icon: icon,
                                title: res.places[i].Address,
                                subtype: res.places[i].subType,
                                draggable: true,
                                Address: res.places[i].Address,
                                area: res.places[i].area,
                                subtype: res.places[i].subType,
                                ptype: res.places[i].pType,
                                uCode: res.places[i].uCode
                            });

                            markers.push(marker);
                            // markersLayer.addLayer(marker);
                           ciLayer.addLayer(marker);
                        }
                        console.log(ciLayer)
                        //ciLayer.addLayers(markers);
                        // $scope.mark = markers;
                        


                    }, function() {
                        swal("Error")
                    })

                });
            });
        });

        $scope.loadMore = function (last, inview) {
    if (last && inview) {
        $scope.limit += 10;
    }   
}



        $scope.changeCenter = function(marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };

         $scope.openSlide = function() {
            $scope.toggle = !$scope.toggle;
        };


    }

}());