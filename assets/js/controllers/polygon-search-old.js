(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('PolygonSearchOld', PolygonSearchOld);
    PolygonSearchOld.$inject = ['$rootScope', '$scope', '$modal', '$http', '$stateParams', '$window', '$anchorScroll', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'MapGeo', 'bsLoadingOverlayService'];

    function PolygonSearchOld($rootScope, $scope, $modal, $http, $stateParams, $window, $anchorScroll, $location, $timeout, leafletData, urls, Auth, DataTunnel, MapGeo, bsLoadingOverlayService) {

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 700);
        });

        $scope.polygonSearchLeftFull = true
        $scope.polygonSearchLeftEight = false
        $scope.polygonSearchRight = false
   
   
         // toggle column
         $scope.polygonSearchCollapse = function(){
              
           if($scope.polygonSearchLeftFull) {
               $scope.polygonSearchLeftFull = false
               $scope.polygonSearchLeftEight = true
               $scope.polygonSearchRight = true
           }else{
               $scope.polygonSearchLeftEight = false
               $scope.polygonSearchRight = false
               $scope.polygonSearchLeftFull = true
           }
         }

        var init = function () {
            Auth.getlocations(urls.POLYGON, function (res) {
                    $scope.areas = res.area;
                    var coordinates = [];
                    var temp = []
                    $scope.areas.map(function (area) {
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

                    $scope.areas.push({
                        id: -1,
                        name: "all",
                        'ST_AsGeoJSON(area)': JSON.stringify({
                            'type': "Polygon",
                            'coordinates': coordinates
                        })
                    });

                },
                function () {

                });
            Auth.getlocations(urls.GET_SUBTYPES, function (res) {
                    $scope.subcategories = res;
                    $scope.subcategories.push({
                        subtype: "all"
                    });
                    //console.log(res);
                },
                function () {

                });

        };
        init();

        var id;
        var info;
        var addressPointsToMarkers = function (points) {
            return points.map(function (ap, i) {
                
                var icon = {
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  }
                if( ap.subType.toLowerCase() == 'water atm') {
                        icon.iconUrl = './assets/img/type/water-atm.png'
                        icon.iconSize =  [40, 46]
                        icon.popupAnchor = [6, -32]
                }                
                else if( $rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {

                    icon.iconUrl = './assets/img/type/'+ap.pType.split(',')[0].toLowerCase()+'.png';

                } else {
                    icon.iconUrl = './assets/img/type/default.png'
                }

                var uc;
                try {
                    uc = ap.update_count.toString()
                } catch(e) {
                    uc = ''
                }

                return {
                    id: ap.id,
                    idx: i,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    Address: ap.Address,
                    area: ap.area,
                    subtype: ap.subType,
                    title: ap.Address,
                    ptype: ap.pType,
                    update_count: uc,
                    flag: false,
                    draggable: true,
                    uCode: ap.uCode,
                    userID: ap.user_id,
                    updated_at: ap.updated_at,
                    message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
                    icon: icon
                };
            });
        };

        var addressPointsToMarker = function (points) {
            return points.map(function (ap, i) {
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
                    icon: {
                        iconUrl: './assets/img/marker-add.svg',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
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
            defaults: {
                doubleClickZoom: false,
                scrollWheelZoom: true,

                map: {
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: [{
                        text: 'Add Place Here',
                        callback: go_to_retool
                    }, {
                        text: 'Whats Here?',
                        callback: rever_geo
                    }, ]
                }
            },
            controls: {
                draw: {}
            },
            events: {
                map: {
                    enable: ['moveend', 'popupopen', 'dblclick', 'contextmenu'],
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
                        // url: 'http://13.229.51.147:8080/geoserver/barikoi/wms?',
                        url: 'http://geoserver.barikoi.com:8080/geoserver/barikoi/wms?',
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

                    //         bkoi: {
                    //     name: 'Barikoi',
                    //     type: 'wms',
                    //     url: 'http://192.168.0.109:6969/geoserver/wms?',
                    //     visible: true,
                    //     layerOptions: {
                    //         layers: 'osm_bd',
                    //         format: 'image/png',
                    //         // opacity: 0.25,
                    //         attribution: 'bkoi',
                    //         crs: L.CRS.EPSG3857
                    //     }
                    // }
                }
            }
        });


        function go_to_retool(e, args) {
            console.log(e);
            DataTunnel.set_data(e)

            var modalInstanangular = $modal.open({
                templateUrl: '../../views/dtool/retool-modal.html',
                controller: 'Retool',
                size: 'lg',
                resolve: {
                    loc: function () {
                        return $scope.place;
                    }
                },
                backdrop: 'static'
            });

        }

        function rever_geo(e, args) {
            console.log(e);
            DataTunnel.set_data(e)

            let data = {
                params: {
                    longitude: e.latlng.lng,
                    latitude: e.latlng.lat
                }
            }

            $http.get(urls.REVERSE_GEO_NO_AUTH, data)
                .success(function (response) {

                    console.log(response[0])

                    let reverseData = response[0]

                    if (typeof reverseData !== 'undefined') {
                        $scope.selecting = reverseData.Address
                    } else {
                        $scope.selecting = 'No data found!'
                    }

                    $scope.markers = addressPointsToMarkers(response)

                })

        }

        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function (baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function (e) {
                    var layer = e.layer;
                    console.log(layer)
                    drawnItems.addLayer(layer);
                    //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                    var array = [];
                    layer.toGeoJSON().geometry.coordinates[0].map(function (ary) {

                        array.push(ary.join(' '));
                    });
                    var coordinates = array.reduce(
                        (accumulator, currentValue) => accumulator.concat(currentValue),
                        []
                    );


                    console.log(coordinates.toString())
                    Auth.get_with_params(urls.POLYGON_CUSTOM + 'area=' + coordinates.toString(), function (res) {
                        $scope.total = res.Total;
                        $scope.markers = addressPointsToMarkers(res.places);

                    }, function () {
                        swal("Error")
                    })

                });
            });
        });

        $scope.set_area = function (area) {
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
                    style: MapGeo.geo_style_rand()
                },


            });
            $scope.markers = {};
        };

        $scope.set_subType = function (area, subtype) {
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });
            if (area == undefined) {
                area = '';
            }
            // if (subtype==undefined) {subtype = '';}

            Auth.get_with_params(urls.PLACE_BY_AREA + 'area' + "=" + area + '&subType' + "=" + subtype, function (res) {
                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
                $scope.total = res.Total;
                $scope.markers = addressPointsToMarkers(res.places);
            }, function () {

                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });

            });
        };

        $scope.$on("leafletDirectiveMarker.click", function (event, args) {
            DataTunnel.set_data(args.model);
            leafletData.getMap().then(function (map) {
                    $timeout(function () {
                        map.invalidateSize();
                        //create bounds
                    }, 100);
                });
        });



        $rootScope.$on("mk-del", function (event, data) {
            console.log($scope.markers[data.idx])
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
            // console.log('id ', $scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id));
            //  $scope.markers.splice($scope.markers.map(function(mk) { return mk.id; }).indexOf(args.model.id), 1);
            //$scope.markers.splice(data.idx, 1);
        });

        $rootScope.$on("mk-upd", function (event, data) {

            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-upd.svg';
            $scope.markers[data.idx].lat = data.lat;
            $scope.markers[data.idx].lng = data.lng;
            // marker updated lat lon to set
        });


        // $rootScope.$on("flag-cng", function(event, data) {
        //     $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-dlt.svg';
        // })

         $rootScope.$on("mk-muv", function(event, data) {
            $scope.markers[data.idx].icon.iconUrl = './assets/img/marker-muv.svg';
        });

        $rootScope.$on("mk-new", function (event, data) {
            var tempary = [];
            tempary.push(data)
            var temp = addressPointsToMarker(tempary)
            console.log(temp)
            $scope.markers.push(temp[0])


        });



        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };



        $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
            var data = {
                'latitude': args.model.lat,
                'longitude': args.model.lng,
            }

            swal({
                    title: "Are you sure?",
                    // text: "You will not be able to recover this imaginary file!",   
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, update marker position!",
                    closeOnConfirm: true
                },
                function (isConfirm) {
                    if (isConfirm) {
                        Auth.updateSomething2(urls.DROP_MARKER + args.model.id + "?longitude=" + args.model.lng + "&latitude=" + args.model.lat, function (res) {
                            // swal("Done", "marker position has been updated");
                            //$scope.markers = $scope.markers;

                            $scope.markers[args.model.idx].lat = args.model.lat;
                            $scope.markers[args.model.idx].lng = args.model.lng;
                            console.log('event handeled success');

                        }, function () {
                            args.model.lat = $scope.markers[args.model.idx].lat;
                            args.model.lng = $scope.markers[args.model.idx].lng;
                            // $scope.markers = $scope.markers;
                        })
                    } else {

                        $scope.$apply(function () {
                            console.log($scope.markers[args.model.idx]);
                            $scope.markers[args.model.idx].flag = !$scope.markers[args.model.idx].flag;
                        });


                    }


                });

        });







        $scope.changeCenter = function (marker) {
            $scope.center.lat = marker.lat;
            $scope.center.lng = marker.lng;
            DataTunnel.set_data(marker);
            marker.focus = true;
        };

        $scope.edit_address = function (referenceId, address, id) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });

            var data = {
                'Address': address,

            }
            console.log(address);
            console.log(id);


            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................
            Auth.updateSomething(urls.UPDATE_ADDRESS + id, data, function (res) {
                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
                swal("Success", res)
            }, function (error) {
                bsLoadingOverlayService.stop({
                    referenceId: 'first'
                });
                swal(error);
            })
        };

        let searchAddressPointsToMarkers = function (points) {
            return points.map(function (ap, i) {
                return {
                    id: ap.id,
                    idx: i,
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
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    }
                };
            });
        };

        $scope.users = function (userName) {
            console.log(userName)
            if (userName.length < 0) {
                return [];
            }
            $scope.loading = true;
            return Auth.getUsers(userName).then(function (data) {

                console.log(data.places);
                $scope.markers = addressPointsToMarkers(data.places);
                $scope.center.lat = parseFloat(data.places[0].latitude);
                $scope.center.lng = parseFloat(data.places[0].longitude);
                $scope.center.zoom = 13;

                $scope.loading = false;
                return data.places;
            }, function (status) {
                $scope.loading = false;
            });
        };


        $scope.onSelect = function (user) {
            // console.log(user);
            $scope.center.lat = parseFloat(user.latitude);
            $scope.center.lng = parseFloat(user.longitude);
            // $scope.active = false;
            leafletData.getMap().then(function (map) {
                $timeout(function () {
                    map.invalidateSize();
                    //create bounds
                }, 1000);
            });


            var tempary = []
            tempary.push(user)

            $scope.markers = addressPointsToMarkers(tempary)
        }

    }

}());