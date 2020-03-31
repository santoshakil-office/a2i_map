(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('Retool', MapperRetoolController)
        .directive('numbersOnly', function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attr, ngModelCtrl) {
                    function fromUser(text) {
                        if (text) {
                            var transformedInput = text.replace(/[^0-9]/g, '');

                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                        return undefined;
                    }
                    ngModelCtrl.$parsers.push(fromUser);
                }
            };
        });

        MapperRetoolController.$inject = ['$rootScope', '$scope', '$http', '$location', '$stateParams', '$timeout', '$modalInstance', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService', '$localStorage'];

    function MapperRetoolController($rootScope, $scope, $http, $location, $stateParams, $timeout, $modalInstance, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService, $localStorage) {
        
        console.log('mapper retool')

        var minLength = 1;
        $scope.imageSrc = {};
        $scope.imageSrc.compressed = {};
        $scope.address = {};
        $scope.center = {};
        $scope.center.lat = 23.757087;
        $scope.center.lng = 90.390370;
        $scope.address.block = "";
        $scope.address.house = "";
        $scope.address.road = "";
        $scope.address.sector = "";
        $scope.address.sub_area = "";
        $scope.address.super_sub_area = "";
        $scope.address.section = "";
        $scope.address.name = "";
        $scope.name = 'World';
        $scope.categories = [{ id: 1, name: 'Home' }, { id: 2, name: 'Food' }];
        $scope.address.category = [];
        var all_subtypes = [];
        $scope.address.road_type = [];
        $scope.listone = "";


        var setValue = function(props, value) {
            while (props.length) $scope.address[props.pop()] = value;
        }


        angular.extend($scope, {
            center: {
                lat: 23.757087,
                lng: 90.390370,
                zoom: 15
            },

            controls: {
                draw: {}
            },

            markers: {
                m1: {
                    lat: 23.757087,
                    lng: 90.390370,
                    draggable: true,
                    icon:{
                        iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.4.0/dist/images/marker-icon.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        // shadowSize: [41, 41]
                    }
                },
            },

            events: { // or just {} //all events
                map: {
                    enable: ['click', 'dblclick', 'moveend', 'popupopen'],
                    logic: 'emit'
                },
                markers: {
                    enable: ['dragend', 'moveend'],
                    logic: 'emit'
                }
            },

            layers: {
                baselayers: {

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

                    barikoi: {
                        name: 'barikoi',
                        url: 'http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            attribution: 'Barikoi',
                            maxZoom: 23
                        },
                    },

                    

                    googleTerrain: {
                        name: 'Google Terrain',
                        layerType: 'TERRAIN',
                        type: 'google',
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
                    // bkoi: {
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

        function reverse_geo(mlat, mlong) {

            $scope.markers.m1.lat = mlat;
            $scope.markers.m1.lng = mlong;

            let paramData = {
                params: {
                    latitude: mlat,
                    longitude: mlong
                }
            };

            $http.get("https://admin.barikoi.xyz/v1/reverse/without/auth", paramData)
                .success(function(response) {
                    $scope.selected = response[0]
                    // $rootScope.error_message
                    $scope.address.Address = response[0].Address;
                    $scope.address.area = response[0].area;
                    $scope.address.city = response[0].city;
                    $scope.address.postCode = response[0].postCode;
                    $scope.bounds = JSON.parse(response[0]['ST_AsGeoJSON(bounds)']);
                    console.log($scope.bounds)
                    angular.extend($scope, {
                        geojson: {
                            data: {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "properties": {},
                                    "geometry": {
                                        "type": "Polygon",
                                        "coordinates": $scope.bounds.coordinates
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
                    })
                    // if (response[0].Address.includes('House')) {
                    //     $scope.address.
                    // } 

                })


            // body...
        }


        function filterItems(query) {
            return query.map(function(q) {

                return all_subtypes.filter(function(el) {
                    return el.type.toLowerCase().indexOf(q.type.toLowerCase()) > -1;
                })

            })

        }


        $scope.$watch('address.category', function() {
            $scope.subcategories = filterItems($scope.address.category).flat();
            console.log($scope.subcategories);

            $scope.pType = $scope.address.category.reduce(function(accumulator, currentValue) {
                return accumulator + currentValue.type + ', ';
            }, '');

        });

        $scope.$watch('address.subcategory', function() {
            // $scope.subcategories = filterItems($scope.address.category).flat();   
            // console.log($scope.subcategories);   
         
            $scope.subType = $scope.address.subcategory.reduce(function(accumulator, currentValue) {
                return accumulator + currentValue.subtype + ', ';
            }, '');
        });

        // $scope.$watch('address.road_type', function() {
        //     // $scope.subcategories = filterItems($scope.address.category).flat();   
        //     // console.log($scope.subcategories);
        //     $scope.roadType = $scope.address.road_type.reduce(function(accumulator, currentValue) {
        //         return accumulator + currentValue.name + ', ';
        //     }, '');
        // });



        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 700);
        });



        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            $scope.markers.m1.lat = args.model.lat;
            $scope.markers.m1.lng = args.model.lng;
            $scope.address.latitude = args.model.lat;
            $scope.address.longitude = args.model.lng;
        });

        // $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {

        //     var leafEvent = args.leafletEvent;

        //     args.model.center.lat = leafEvent.latlng.lat
        //     args.model.center.lng = leafEvent.latlng.lng
        //     args.model.center.zoom = 14
        //     $scope.markers.m1.lat = leafEvent.latlng.lat;
        //     $scope.markers.m1.lng = leafEvent.latlng.lng


        // });

        $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {

            const markerLatitude = args.leafletEvent.latlng.lat
            const markerLongitude = args.leafletEvent.latlng.lng

            reverse_geo(markerLatitude, markerLongitude)

        });


        // $scope.roadtypes = ["0.25 Lane", "0.5 Lane", "1 Lane", "2 Lane", "4 Lane", "6 Lane", "8 Lane", "Asphalt", "Concrete", "Unpaved", "Good", "Bad", "Disaster"];

        var init = function() {

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
                        $scope.bounds = array.reduce(
                            (accumulator, currentValue) => accumulator.concat(currentValue),
                            []
                        );

                    });
                });
            });

            //console.log(loc)
            if (DataTunnel.get_data() != undefined) {

                if (DataTunnel.get_data().uCode != undefined) {
                    $http.get(urls.SEARCH_CODE + DataTunnel.get_data().uCode)
                        .success(function(res) {
                            console.log(res);
                            $scope.markers.m1.lat = parseFloat(res.latitude);
                            $scope.markers.m1.lng = parseFloat(res.longitude);
                            $scope.center.lat = parseFloat(res.latitude);
                            $scope.center.lng = parseFloat(res.longitude);
                            $scope.address = res;
                            $scope.pview = res.pType;
                            $scope.sub_view = res.subType;
                            $scope.road_view = res.road_details;
                            $scope.pType = res.pType;
                            $scope.subType = res.subType;
                            $scope.roadType = res.road_details;

                            var type = {
                                'pType': res.pType,
                                'subType': res.subType
                            }

                            //setValue( ["city", "area", "postCode", "name", "house", "road", "sub_area", "super_sub_area", "Address"] , "" );

                            DataTunnel.address_split($scope.address, res.Address, type);

                            try {
                                $scope.imageSrc.compressed.dataUrl = res.images[0].imageLink;
                            } catch (error) {

                            }
                            var bounds = JSON.parse(res['ST_AsGeoJSON(bounds)']);
                            console.log(bounds)
                            angular.extend($scope, {
                                geojson: {
                                    data: {
                                        "type": "FeatureCollection",
                                        "features": [{
                                            "type": "Feature",
                                            "properties": {},
                                            "geometry": {
                                                "type": "Polygon",
                                                "coordinates": bounds.coordinates
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
                            })
                            // $scope.map.setCenter({lat: $scope.address.latitude, lng: $scope.address.longitude});

                        })
                        .error(function(err) {
                            console.log(err);
                        });
                } else {
                     var loc = DataTunnel.get_data();

            try {
                $scope.center.lat = loc.latlng.lat;
                $scope.center.lng = loc.latlng.lng;
                $scope.center.zoom = 14;
                $scope.markers.m1.lat = loc.latlng.lat;
                $scope.markers.m1.lng = loc.latlng.lng;
                reverse_geo($scope.markers.m1.lat,  $scope.markers.m1.lng)
            } catch (e) {
                $scope.center.lat = 23.757087;
                $scope.center.lng = 90.39037;
                $scope.markers.m1.lat = 23.757087;
                $scope.markers.m1.lng = 90.39037;
            }

                }

            }


            $http.get(urls.GET_CATEGORY)
                .success(function(res) {
                    $scope.categories = res;
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
                                $scope.bounds = array.reduce(
                                    (accumulator, currentValue) => accumulator.concat(currentValue),
                                    []
                                );

                            });
                        });
                    });
                })
                .error(function(err) {
                    console.log(err);
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
                                $scope.bounds = array.reduce(
                                    (accumulator, currentValue) => accumulator.concat(currentValue),
                                    []
                                );

                            });
                        });
                    });
                });



        }

        init();


        //Map Initializaton...........................................................

        // var map;
        //   $scope.$on('mapInitialized', function(evt, evtMap) {
        //    map = evtMap;
        //    map.setCenter({lat: $rootScope.currentlat, lng: $rootScope.currentlng});
        // });
        // $scope.positions = [
        //     {
        //       "latitude" : '23.757087',
        //       "longitude" : '90.390370',
        //       "index" : 0
        //     }
        // ];


        // //Map Event. Triggerd When Maker Is Mooved.........................................
        // $scope.pin_mooved = function(events, marker) {
        //     var pos = marker.$index;
        //     //map.setCenter(map.markers[pos].getPosition());
        //     $scope.address.latitude = map.markers[pos].getPosition().lat();
        //     $scope.address.longitude = map.markers[pos].getPosition().lng();
        // }

        //  $scope.$watch('address', function() {
        //      $scope.map.setCenter({lat: parseFloat($scope.address.latitude), lng:  parseFloat($scope.address.longitude)});
        // });

        //Get All Subcategories Depending on the Category Choosen...........................................

        $scope.subcategories = [{ key: '1', name: 'tut' }];
        Auth.getlocations(urls.GET_SUBTYPES, function(res) {
                $scope.subcategories = res;
                all_subtypes = $scope.subcategories;

            },
            function() {

            });

        $scope.getSubCategory = function() {
            var st = $scope.address.category.type.toString();
            $http.get(urls.GET_SUB_CATEGORY + st)
                .success(function(res) {
                    $scope.subcategories = [];

                    res.map(function(st) {
                        $scope.subcategories.push({ key: st.id, name: st.subtype })
                    });
                    //console.log($scope.subcategories);

                })
                .error(function(err) {
                    console.log(err);
                });
        };

        Auth.getlocations(urls.TOTAL_USER, function(res) {
            $scope.userlist = res.data.list_users;
            
        },
         function() {
            $rootScope.error = 'Failed to fetch details';
        });

        $scope.set_consumer = function(consumer) {
            console.log(consumer.device_ID)
        }



        $scope.onSelected = function(field, selectedItem) {
            $scope.address[field] = selectedItem;
            console.log($scope.address[field])

            if (field == 'category') {

            }
        };




        $scope.add_place = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });


            var rex = /\w*[a-zA-Z0-9]\w*/g; //alphanumeric
            // var reg = new RegExp(/^\d+$/); //onlynumeric
            var reg = new RegExp(/^\d{1,3}/); //onlynumeric
            var rexFloor = /^\d+$/;

            var tempSubarea;
            try {
                tempSubarea =
                    $scope.address.sub_area.match(rex) != null ?
                    "" + $scope.address.sub_area + ", " :
                    "";
            } catch {
                tempSubarea = "";
            }

            console.log("subarea " + tempSubarea);

            var tempSuparea;
            try {
                tempSuparea =
                    $scope.address.super_sub_area.match(rex) != null ?
                    "" + $scope.address.super_sub_area + ", " :
                    "";
            } catch (e) {
                tempSuparea = "";
            }
            console.log("suparea " + tempSuparea);

            var tempHouse;
            try {
                tempHouse =
                    $scope.address.house.match(rex) != null ?
                    "House " + $scope.address.house + ", " :
                    "";
            } catch (e) {
                tempHouse = ""
            }

            console.log("house " + tempHouse);

            var tempFloor;
            try {
                tempFloor =
                    $scope.address.floor.match(rex) != null ?
                    $scope.address.floor :
                    "";

                    if ( $scope.address.floor.match(rex) !== null) {
                         tempFloor = tempFloor + ', '
                    } else {
                        $scope.address.floor = ''
                    }

                // if ($scope.address.floor.toLowerCase().includes('floor')) {
                //     tempFloor = tempFloor+ ", ";
                    
                // }
            //     else{
            //         if (rexFloor.test($scope.address.floor)) {
            //             tempFloor = "Floor " + tempFloor + ", ";
            //             //  $scope.address.floor = "Floor " +  $scope.address.floor;
            //         } else {
            //             tempFloor = tempFloor + " Floor" + ", ";

            //             // $scope.address.floor = tempFloor + " Floor";
            //         }
            //         $scope.address.floor = tempFloor 
                } catch (e) {
                tempFloor = ""
            }

            var tempBuildingName;
            try {
                tempBuildingName =
                    $scope.address.section.match(rex) != null ?
                    $scope.address.section + ", " :
                    "";
            } catch (e) {
                tempBuildingName = ""
            }

            console.log("house " + tempBuildingName);

            var tempRoad;
            try {
                var tempRoad =
                    $scope.address.road.match(rex) != null ?
                    $scope.address.road + ", " :
                    "";
                    if (reg.test($scope.address.road) && $scope.address.road.length <= 3) {
                        tempRoad = "Road " + tempRoad;
                        $scope.address.road = "Road " + $scope.address.road
                    }
                    if (rexFloor.test($scope.address.road)) {
                        tempRoad = "Road " + tempRoad;
                        $scope.address.road = "Road " + $scope.address.road
                    }
                     else {
                        tempRoad = tempRoad;
                    }
                    
            } catch (e) {
                tempRoad = ""
            }



            // tempRoad = reg.test($scope.address.road) ? "Road " + tempRoad : tempRoad;
            console.log("road " + tempRoad);

            var tempAddress;
            try {
                tempAddress =
                    $scope.address.name.match(rex) != null ?
                    
                    $scope.address.name +
                    ", " +
                    tempFloor+
                    tempBuildingName+
                    tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea : 
                    tempBuildingName + tempFloor + tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea
            } catch (e) {
                tempAddress = 
                    tempBuildingName + tempFloor + tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea
            }


            tempAddress = tempAddress.replace(/,\s*$/, "");
            console.log(tempAddress);
            tempAddress.replace(/(^\s*)|(\s*$)/gi, "");
            tempAddress = tempAddress.replace(/[ ]{2,}/gi, " ");
            tempAddress = tempAddress.replace(/[ ],/gi, ",");
            tempAddress = tempAddress.replace(/\n /, "\n");
            console.log(tempAddress);


            $scope.address.Address = tempAddress;
            //console.log($scope.address.Address);
            var data = {
                'latitude': $scope.markers.m1.lat,
                'longitude': $scope.markers.m1.lng,
                'Address': $scope.address.Address,
                'city': $scope.address.city,
                'holding_no': $scope.address.house,
                'road_name_number': $scope.address.road,
                'business_name': $scope.address.name,
                'name': $scope.address.section,
                'sub_area': $scope.address.sub_area,
                'super_sub_area': $scope.address.super_sub_area,
                'area': $scope.address.area,
                'postCode': $scope.address.postCode,
                'pType': $scope.pType.replace(/,\s*$/, ""),
                'subType': $scope.subType.replace(/,\s*$/, ""),
                'floor': $scope.address.floor,
                'number_of_floors': $scope.address.number_of_floors,
                'email': $scope.address.email,
                'flag': 1,
                'contact_person_name': $scope.address.contact_person_name,
                'contact_person_phone': $scope.address.contact_person_phone,
                'route_description': $scope.address.route_description,
                'tags': DataTunnel.get_tag()
            }
            try {
                data['images'] = $scope.imageSrc.compressed.dataURL.slice($scope.imageSrc.compressed.dataURL.indexOf(',') + 1);
            } catch (error) {
                console.log(data);
            };
            try {
                data["bounds"] = $scope.bounds.toString();
            } catch (error) {
                console.log(data);
            };
            console.log(data);

            // Send Data Through Auth Service.......
            // Auth Service IS Responsible for Handling Http Request and Authentication......................

            Auth.addaddress(urls.DTOOL_ADD_PLACE, data, function(res) {
                $rootScope.$broadcast("mk-new", data); 
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
                }, 600);


                $scope.house = "";
                $scope.address.name = "";
                $scope.bounds = null;
                $scope.imageSrc = null;
                $scope.subcategories = all_subtypes;
                swal("Success", 'New Address Create')
            }, function(error) {
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
                }, 1000);
            })
        };

        $scope.vault_place = function(referenceId) {

            console.log('vault function');
            
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });


            var rex = /\w*[a-zA-Z0-9]\w*/g; //alphanumeric
            // var reg = new RegExp(/^\d+$/); //onlynumeric
            var reg = new RegExp(/^\d{1,3}/); //onlynumeric
            var rexFloor = /^\d+$/;

            var tempSubarea;
            try {
                tempSubarea =
                    $scope.address.sub_area.match(rex) != null ?
                    "" + $scope.address.sub_area + ", " :
                    "";
            } catch {
                tempSubarea = "";
            }

            console.log("subarea " + tempSubarea);

            var tempSuparea;
            try {
                tempSuparea =
                    $scope.address.super_sub_area.match(rex) != null ?
                    "" + $scope.address.super_sub_area + ", " :
                    "";
            } catch (e) {
                tempSuparea = "";
            }
            console.log("suparea " + tempSuparea);

            var tempHouse;
            try {
                tempHouse =
                    $scope.address.house.match(rex) != null ?
                    "House " + $scope.address.house + ", " :
                    "";
            } catch (e) {
                tempHouse = ""
            }

            console.log("house " + tempHouse);

            var tempFloor;
            try {
                tempFloor =
                    $scope.address.floor.match(rex) != null ?
                    $scope.address.floor :
                    "";

                if ($scope.address.floor.toLowerCase().includes('floor')) {
                    tempFloor = tempFloor+ ", ";
                    debugger;
                }
                else{
                    if (rexFloor.test($scope.address.floor)) {
                        tempFloor = "Floor " + tempFloor + ", ";
                         $scope.address.floor = "Floor " +  $scope.address.floor;
                    } else {
                        tempFloor = tempFloor + " Floor" + ", ";
                        $scope.address.floor = $scope.address.floor + " Floor";
                    }
                }

            } catch (e) {
                tempFloor = ""
            }

            var tempBuildingName;
            try {
                tempBuildingName =
                    $scope.address.section.match(rex) != null ?
                    $scope.address.section + ", " :
                    "";
            } catch (e) {
                tempBuildingName = ""
            }

            console.log("house " + tempBuildingName);

            var tempRoad;
            try {
                var tempRoad =
                    $scope.address.road.match(rex) != null ?
                    $scope.address.road + ", " :
                    "";
                    if (reg.test($scope.address.road) && $scope.address.road.length <= 3) {
                        tempRoad = "Road " + tempRoad;
                        $scope.address.road = "Road " + $scope.address.road
                    }
                    if (rexFloor.test($scope.address.road)) {
                        tempRoad = "Road " + tempRoad;
                        $scope.address.road = "Road " + $scope.address.road
                    }
                     else {
                        tempRoad = tempRoad;
                    }
                    
            } catch (e) {
                tempRoad = ""
            }



            // tempRoad = reg.test($scope.address.road) ? "Road " + tempRoad : tempRoad;
            console.log("road " + tempRoad);

            var tempAddress;
            try {
                tempAddress =
                    $scope.address.name.match(rex) != null ?
                    
                    $scope.address.name +
                    ", " +
                    tempFloor+
                    tempBuildingName+
                    tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea :
                    tempFloor +
                    tempBuildingName +
                    tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea
            } catch (e) {
                tempAddress = 
                    tempBuildingName + tempFloor + tempHouse +
                    tempRoad +
                    tempSuparea +
                    tempSubarea
            }


            tempAddress = tempAddress.replace(/,\s*$/, "");
            console.log(tempAddress);
            tempAddress.replace(/(^\s*)|(\s*$)/gi, "");
            tempAddress = tempAddress.replace(/[ ]{2,}/gi, " ");
            tempAddress = tempAddress.replace(/[ ],/gi, ",");
            tempAddress = tempAddress.replace(/\n /, "\n");
            console.log(tempAddress);


            $scope.address.Address = tempAddress;
            //console.log($scope.address.Address);
            var data = {
                'latitude': $scope.markers.m1.lat,
                'longitude': $scope.markers.m1.lng,
                'Address': $scope.address.Address,
                'city': $scope.address.city,
                'holding_no': $scope.address.house,
                'road_name_number': $scope.address.road,
                'business_name': $scope.address.name,
                'name': $scope.address.section,
                'sub_area': $scope.address.sub_area,
                'super_sub_area': $scope.address.super_sub_area,
                'area': $scope.address.area,
                'postCode': $scope.address.postCode,
                'pType': $scope.pType.replace(/,\s*$/, ""),
                'subType': $scope.subType.replace(/,\s*$/, ""),
                'floor': $scope.address.floor,
                'email': $scope.address.email,
                'flag': 1,
                'contact_person_name': $scope.address.contact_person_name,
                'contact_person_phone': $scope.address.contact_person_phone,
                'route_description': $scope.address.route_description,
                'tags': DataTunnel.get_tag(),
                'task_id': $localStorage.task_id
            }
            try {
                data['images'] = $scope.imageSrc.compressed.dataURL.slice($scope.imageSrc.compressed.dataURL.indexOf(',') + 1);
            } catch (error) {
                console.log(data);
            };
            try {
                data["bounds"] = $scope.bounds.toString();
            } catch (error) {
                console.log(data);
            };
            console.log(data);

            // Send Data Through Auth Service.......
            // Auth Service IS Responsible for Handling Http Request and Authentication......................

            Auth.addaddress('https://admin.barikoi.xyz/v1/auth/place/newplace/mapper/vault', data, function(res) {
                $rootScope.$broadcast("mk-new", data); 
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
                }, 600);


                $scope.house = "";
                $scope.address.name = "";
                $scope.bounds = null;
                $scope.imageSrc = null;
                $scope.subcategories = all_subtypes;
                swal("Success", 'New Vault Address Created')
            }, function(error) {
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
                }, 1000);
            })
        };

        $scope.showOverlay = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            var order_list = csvToArray($scope.fileContent, ',');
            for (var ea in order_list) {

                var data = {

                    'latitude': order_list[ea][1],
                    'longitude': order_list[ea][0],
                    'Address': order_list[ea][2],
                    'city': order_list[ea][3],
                    'area': order_list[ea][4],
                    'postCode': order_list[ea][5],
                    'pType': order_list[ea][6],
                    'subType': order_list[ea][7],
                }
                console.log(data);
                // Send Data Through Auth Service.......
                // Auth Service IS Responsible for Handling Http Request and Authentication......................

                Auth.addaddress(urls.DTOOL_ADD_PLACE, data, function(res) {
                    if (ea == order_list.length - 1) {

                        $timeout(function() {
                            bsLoadingOverlayService.stop({
                                referenceId: 'first'
                            });
                            swal("Success", "Places Added ")
                        }, 2000);
                    };
                }, function() {
                    // swal("Error")
                    console.log('erro');
                });

            }

        };


        $scope.getdirection = function() {

            if (this.getPlace().geometry.location) {
                $scope.center.lat = this.getPlace().geometry.location.lat();
                $scope.center.lng = this.getPlace().geometry.location.lng();
                $scope.markers.m1.lat = this.getPlace().geometry.location.lat();
                $scope.markers.m1.lng = this.getPlace().geometry.location.lng();

            };
        };

        function csvToArray(strData, strDelimiter) {
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
            var arrData = [
                []
            ];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;


            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                ) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);

                }

                var strMatchedValue;

                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );

                } else {

                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            return (arrData);
        }


        $scope.onSelect = function(user) {
            $scope.selected = user;
            console.log('usr', user);

            var type = {
                'pType': user.pType,
                'subType': user.subType
            }

            setValue(["city", "area", "postCode", "name", "house", "road", "sub_area", "super_sub_area", "Address"], "");
            $scope.markers.m1.lat = parseFloat($scope.selected.latitude);
            $scope.markers.m1.lng = parseFloat($scope.selected.longitude)
            $scope.center.lat = parseFloat($scope.selected.latitude);
            $scope.center.lng = parseFloat($scope.selected.longitude);
            $scope.address.city = user.city;
            $scope.address.area = user.area;
            $scope.address.postCode = user.postCode;
            $scope.address.Address = user.Address;
            $scope.address.latitude = user.latitude;
            $scope.address.longitude = user.longitude;
            $scope.address.number_of_floors = user.number_of_floors;

            $scope.pview = user.pType;
            $scope.sub_view = user.subType;
            $scope.pType = user.pType;
            $scope.subType = user.subType;

            DataTunnel.address_split($scope.address, user.Address, type);
            $scope.address.road_details = user.road_details;


            $http.get(urls.SEARCH_CODE + user.uCode)
                .success(function(res) {
                    $scope.bounds = JSON.parse(res['ST_AsGeoJSON(bounds)']);
                    console.log($scope.bounds)
                    angular.extend($scope, {
                        geojson: {
                            data: {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "properties": {},
                                    "geometry": {
                                        "type": "Polygon",
                                        "coordinates": $scope.bounds.coordinates
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
                    })
                })

        };
        $scope.users = function(userName) {
            if (userName.length < minLength) {
                return [];
            }
            $scope.loading = true;
            return Auth.getUsers(userName).then(function(data) {
                $scope.loading = false;
                //$scope.markers = addressPointsToMarker(data.places);
                // console.log(data.places);
                return data.places;
            }, function(status) {
                $scope.loading = false;
                //$rootScope.error = 'Failed to fetch data';
                $timeout(function() {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                    $scope.markers.m1 = {}
                }, 2000);
            });
        };

        $scope.set_marker_position = function(mlatlng) {
            var mlat = mlatlng.split(',')[0];
            var mlng = mlatlng.split(',')[1];
            $scope.center.lat = parseFloat(mlat);
            $scope.center.lng = parseFloat(mlng);
            reverse_geo($scope.center.lat, $scope.center.lng)

        }


        $scope.ok = function() {
          $modalInstance.close();
      };


        // console.clear()

    }

}());

// https://admin.barikoi.xyz/v1/auth/place/newplace/mapper/vault