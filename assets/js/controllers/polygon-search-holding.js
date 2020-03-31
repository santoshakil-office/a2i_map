(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('PolygonSearchHolding', PolygonSearchHolding);
    PolygonSearchHolding.$inject = ['$rootScope', '$scope', '$modal', '$http', '$stateParams', '$window', '$anchorScroll', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function PolygonSearchHolding($rootScope, $scope, $modal, $http, $stateParams, $window, $anchorScroll, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {

        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 2000);
        });

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

                    $scope.areas.push({ id: -1, name: "all", 'ST_AsGeoJSON(area)': JSON.stringify({ 'type': "Polygon", 'coordinates': coordinates }) });

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

        var id;
        var info;
        var addressPointsToMarkers = function(points) {
            return points.map(function(ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };
                
                return {
                    id: ap.id,
                    idx: i,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.house_no,
                    // area: ap.area,
                    // subtype: ap.subType,
                    // ptype: ap.pType,
                    flag: false,
                    //draggable: true,
                    uCode: ap.uCode,
                    // userID: ap.user_id,
                    // updated_at: ap.updated_at,
                    // message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
                    icon: {
                        type: 'div',
                        iconSize: null,
                        html: '<div class="map-label redborder"><div class="map-label-content">' + ap.house_no + '</div><div class="map-label-arrow"></div></div>'
                        // iconUrl: './assets/img/type/' + ap.pType.split(',')[0].toLowerCase() + '.png',
                        // iconSize: [20, 20], // size of the icon
                    }
                };
            });
        };

        var addressPointsToMarker = function(points) {
            return points.map(function(ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.Address,

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
                    enable: ['moveend', 'popupopen', 'dblclick'],
                    logic: 'emit'
                },
                marker: {
                    enable: ['click', 'dblclick', 'dragend'],
                    logic: 'emit'
                }
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
                    },

                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google',
                        layerOptions: {

                            attribution: 'barikoi',
                            maxZoom: 23
                        }
                    },




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
                    new: {
                        name: 'new',
                        type: 'group',
                        visible: true
                    },
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


                    console.log(coordinates.toString())
                    Auth.get_with_params(urls.POLYGON_HOLDING + 'area=' + coordinates.toString(), function(res) {
                        $scope.total = res.Total;
                        $scope.markers = addressPointsToMarkers(res.places);

                    }, function() {
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
                

                events: {
                    map: {
                        enable: ['moveend', 'popupopen', 'dblclick'],
                        logic: 'emit'
                    },
                    marker: {
                        enable: ['click', 'dblclick', 'dragend'],
                        logic: 'emit'
                    }
                },

                
                geojson: {
                    data: {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": polyjson.coordinates
                            }
                        }]
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
            if (area == undefined) { area = ''; }
            // if (subtype==undefined) {subtype = '';}

            Auth.get_with_params(urls.PLACE_BY_AREA + 'area' + "=" + area + '&subType' + "=" + subtype, function(res) {
                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
                $scope.total = res.Total;
                $scope.markers = addressPointsToMarkers(res.places);
            }, function() {

                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });

            });
        };

        // $scope.$on("leafletDirectiveMarker.click", function(event, args) {
        //     DataTunnel.set_data(args.model);
            
        // });

        // $rootScope.$on("mk-del", function(event, data) {

        //         // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
        //         //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
        //         $scope.markers[data.idx].icon.html = '<div class="map-label inactive"><div class="map-label-content">' + data.Address + '</div><div class="map-label-arrow"></div></div>';

        //     })

        // $rootScope.$on("mk-new", function(event, data) {
        //     var tempary = [];
        //     tempary.push(data)
        //         console.log(data)

        //         $scope.markers['new'] = addressPointsToMarker(tempary)


        //     })


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


        // $scope.$watch("mapView", function(value) {
        //     console.log($scope.mapView);
        //     if (value === true) {
        //         leafletData.getMap().then(function(map) {
        //             $timeout(function() {
        //                 map.invalidateSize();
        //                 //create bounds
        //                 leafletData.getMap().then(function(map) {
        //                     if ($scope.mapBounds.length < 1) { $scope.mapBounds.push([$scope.location.coords.longitude, $scope.location.coords.latitude]) }
        //                     var bbox = L.latLngBounds($scope.mapBounds);
        //                     $scope.maxBounds.southWest = bbox.getSouthWest();
        //                     $scope.maxBounds.northEast = bbox.getNorthEast();
        //                     map.fitBounds(bbox);
        //                 });
        //             }, 300);
        //         });
        //     }
        // });

        // $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
        //     var data = {
        //         'latitude': args.model.lat,
        //         'longitude': args.model.lng,
        //     }

        //     swal({
        //             title: "Are you sure?",
        //             // text: "You will not be able to recover this imaginary file!",   
        //             type: "warning",
        //             showCancelButton: true,
        //             confirmButtonColor: "#DD6B55",
        //             confirmButtonText: "Yes, update marker position!",
        //             closeOnConfirm: true
        //         },
        //         function(isConfirm) {
        //             if (isConfirm) {
        //                 Auth.updateSomething2(urls.DROP_MARKER + args.model.id + "?longitude=" + args.model.lng + "&latitude=" + args.model.lat, function(res) {
        //                     // swal("Done", "marker position has been updated");
        //                     //$scope.markers = $scope.markers;

        //                     $scope.markers[args.model.idx].lat = args.model.lat;
        //                     $scope.markers[args.model.idx].lng = args.model.lng;
        //                     console.log('event handeled success');

        //                 }, function() {
        //                     args.model.lat = $scope.markers[args.model.idx].lat;
        //                     args.model.lng = $scope.markers[args.model.idx].lng;
        //                     // $scope.markers = $scope.markers;
        //                 })
        //             } else {

        //                 $scope.$apply(function() {
        //                     $scope.markers[args.model.idx].flag = !$scope.markers[args.model.idx].flag;
        //                 });


        //             }


        //         });

        // });

        // $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {
        //     console.log(args);
        //     //   $scope.markers = [];
        //     //  bsLoadingOverlayService.start({
        //     //         referenceId: 'first'
        //     // });
        //     args.leafletEvent;

        //     DataTunnel.set_data(args.leafletEvent)

        //     var modalInstance = $modal.open({
        //         templateUrl: '../../views/dtool/add-place.html',
        //         controller: 'DtollPlaceAdd',
        //         size: 'lg',
        //         scope: $scope,
        //         resolve: {
        //             loc: function() {
        //                 return $scope.place;
        //             }
        //         }
        //     });


        // });




        $scope.changeCenter = function(marker) {
            $scope.center.lat = marker.lat;
            $scope.center.lng = marker.lng;
            DataTunnel.set_data(marker);
            marker.focus = true;
        };

        // $scope.edit_address = function(referenceId, address, id) {
        //     bsLoadingOverlayService.start({
        //         referenceId: referenceId
        //     });

        //     var data = {
        //         'Address': address,

        //     }
        //     console.log(address);
        //     console.log(id);


        //     //Send Data Through Auth Service.......
        //     //Auth Service IS Responsible for Handling Http Request and Authentication......................
        //     Auth.updateSomething(urls.UPDATE_ADDRESS + id, data, function(res) {
        //         bsLoadingOverlayService.stop({
        //             referenceId: 'first'
        //         });
        //         swal("Success", res)
        //     }, function(error) {
        //         bsLoadingOverlayService.stop({
        //             referenceId: 'first'
        //         });
        //         swal(error);
        //     })
        // };

        let searchAddressPointsToMarkers = function(points) {
            return points.map(function(ap) {
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    message: ap.Address,
                    pType: ap.pType,
                    Address: ap.Address,
                    subtype: ap.subType,
                    uCode: ap.uCode,
                    userID: ap.user_id,
                    updated_at: ap.updated_at,
                    icon: {
                        iconUrl: "./assets/img/type/" +
                            ap.pType.split(",")[0].toLowerCase() +
                            ".png",
                    }
                };
            });
        };

        // $scope.users = function(userName) {
        //     console.log(userName)
        //     if (userName.length < 0) {
        //         return [];
        //     }
        //     $scope.loading = true;
        //     return Auth.getUsers(userName).then(function(data) {

        //         console.log(data.places);
        //         // $rootScope.markers = addressPointsToMarkers(data.places);

        //         $scope.loading = false;
        //         return data.places;
        //     }, function(status) {
        //         $scope.loading = false;
        //     });
        // };


        // $scope.onSelect = function(user) {
        //     // console.log(user);
        //     $scope.center.lat = parseFloat(user.latitude);
        //     $scope.center.lng = parseFloat(user.longitude);
        //     // $scope.active = false;
        //     leafletData.getMap().then(function(map) {
        //         $timeout(function() {
        //             map.invalidateSize();
        //             //create bounds
        //         }, 1000);
        //     });


        //     var tempary = []
        //     tempary.push(user)

        //     $scope.markers = searchAddressPointsToMarkers(tempary)
        // }

    }

}());