(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('UpdatePlaceModal', UpdatePlaceModal);

    UpdatePlaceModal.$inject = ['$rootScope', '$scope', '$http', '$location', '$timeout', '$modalInstance', 'leafletData', 'urls', 'Auth', 'loc', 'bsLoadingOverlayService', 'DataTunnel'];

    function UpdatePlaceModal($rootScope, $scope, $http, $location, $timeout, $modalInstance, leafletData, urls, Auth, loc, bsLoadingOverlayService, DataTunnel) {
        $scope.imageSrc = {};
        $scope.imageSrc.compressed = {};
        $scope.address = {};
        $scope.tagsArray = []
        // $scope.subtypelabel = {
        //     "select" : "subType"
        // }

        var defaultlat = parseFloat(loc.lat);
        var defaultlng = parseFloat(loc.lngt);
        var supportTagsArray = []

        angular.extend($scope, {
            center: {
                lat: defaultlat,
                lng: defaultlng,
                zoom: 15
            },

            controls: {
                draw: {}
            },

            markers: {
                m1: {
                    lat: defaultlat,
                    lng: defaultlng,
                    draggable: true,
                    icon: {
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
                    enable: ['moveend', 'popupopen', "dblclick", "click"],
                    logic: 'emit'
                },
                markers: {
                    enable: ['dragend', 'moveend', 'click'],
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

                }
            }
        });

        var all_subtypes = [];
        $scope.listone = "";

        var setValue = function (props, value) {
            while (props.length) $scope.address[props.pop()] = value;
        }

        $http.get(urls.GET_CATEGORY)
            .success(function (res) {
                $scope.categories = res;
            })
            .error(function (err) {
                console.log(err);
            });

        $scope.subcategories = [{
            key: '1',
            name: 'tut'
        }];
        Auth.getlocations(urls.GET_SUBTYPES, function (res) {
                $scope.subcategories = res;

                all_subtypes = $scope.subcategories;

            },
            function () {

            });


        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                console.log('loaded')

                leafletData.getMap().then(function(map) {
                    leafletData.getLayers().then(function(baselayers) {
                        var drawnItems = baselayers.overlays.draw;
                        map.on('draw:created', function(e) {
                            console.log(e + 'drawed')
                            var layer2 = e.layer;
                            drawnItems.addLayer(layer2);
                            //console.log(JSON.stringify(layer2.toGeoJSON().geometry.coordinates[0]));
                            var array = [];
                            layer2.toGeoJSON().geometry.coordinates[0].map(function(ary) {
    
                                array.push(ary.join(' '));
                            });
                            $scope.bounds = array.reduce(
                                (accumulator, currentValue) => accumulator.concat(currentValue),
                                []
                            );
    
                        });
                    });
                })
                
            }, 500);
        });


        $scope.categories = [{
            id: 1,
            name: 'Home'
        }, {
            id: 2,
            name: 'Food'
        }];
        $scope.address.category = [];
        var all_subtypes = [];
        $scope.address.road_type = [];

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
                .success(function (response) {
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


            return query.map(function (q) {
                if (q == '') return all_subtypes;

                return all_subtypes.filter(function (el) {
                    return el.type.toLowerCase().indexOf(q.type.toLowerCase()) > -1;
                })

            })

        }



        $scope.$watch('address.category', function () {
            console.log($scope.address.category);
            $scope.subcategories = all_subtypes;
            if ($scope.address.category != []) {
                $scope.subcategories = filterItems($scope.address.category).flat();
            }

            console.log($scope.subcategories);


            $scope.pType = $scope.address.category.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.type + ', ';
                }, '').replace(/,\s*$/, ""),
                $scope.pview = $scope.pType;


            if ($scope.address.category.length == 0) {
                $scope.pType = $scope.address.pType;
                $scope.pview = $scope.address.pType;

            }


        });

        $scope.$watch('address.subcategory', function () {
            // $scope.subcategories = filterItems($scope.address.category).flat();   
            // console.log($scope.subcategories);   
            $scope.subType = $scope.address.subcategory.reduce(function (accumulator, currentValue) {
                    return accumulator + currentValue.subtype + ', ';
                }, '').replace(/,\s*$/, ""),

                $scope.sub_view = $scope.subType;

            if ($scope.address.subcategory.length == 0) {
                $scope.subType = $scope.address.subType;
                $scope.sub_view = $scope.address.subType;

            }
        });



        $scope.address = {};


        $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
            $scope.markers.m1.lat = args.model.lat;
            $scope.markers.m1.lng = args.model.lng;
            $scope.address.latitude = args.model.lat;
            $scope.address.longitude = args.model.lng;
        });


        $scope.$on("leafletDirectiveMap.dblclick", function (event, args) {

            const markerLatitude = args.leafletEvent.latlng.lat
            const markerLongitude = args.leafletEvent.latlng.lng

            reverse_geo(markerLatitude, markerLongitude)

        });


        $scope.$on("leafletDirectiveMap.click", function (event, args) {

        });


        $scope.subcategories = [{
            key: '1',
            name: 'tut'
        }];


        var init = function () {


            //console.log(loc)
            $http.get(urls.SEARCH_CODE + loc.uCode)
                .success(function (res) {
                    console.log(res);
                    $scope.address = res;
                    $scope.pview = res.pType;
                    $scope.sub_view = res.subType;
                    $scope.road_view = res.road_details;
                    $scope.pType = res.pType;
                    $scope.subType = res.subType;
                    $scope.roadType = res.road_details;
                    $scope.markers.m1.lat = parseFloat(res.latitude);
                    $scope.markers.m1.lng = parseFloat(res.longitude);
                    $scope.center.lat = parseFloat(res.latitude);
                    $scope.center.lng = parseFloat(res.longitude);
                    let tagString = res.tags;
                    // const pTypeString = res.pType;
                    // const subTypeString = res.subType

                    // $scope.pTypeArray = pTypeString.split(',')
                    // $scope.subTypeArray = subTypeString.split(',')

                    if (tagString !== null) {
                        $scope.tagsArray = tagString.split(',')
                        supportTagsArray = $scope.tagsArray
                    }

                    // console.log($scope.subTypeString);


                    var type = {
                        'pType': res.pType,
                        'subType': res.subType
                    }

                    DataTunnel.address_split($scope.address, res.Address, type);

                    $scope.bounds = JSON.parse(res['ST_AsGeoJSON(bounds)']);
                    console.log($scope.bounds);
                    var tempBound = [];
                    $scope.bounds.coordinates[0].map(function (ary) {

                        tempBound.push(ary.join(' '));
                    });
                    $scope.bounds = tempBound.reduce(
                        (accumulator, currentValue) => accumulator.concat(currentValue),
                        []
                    );

                    leafletData.getMap().then(function (map) {
                        console.log('draw mmap')
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            map.on('draw:created', function (e) {
                                var layer = e.layer;
                                drawnItems.addLayer(layer);
                                console.log(layer)
                                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                                var array = [];
                                layer.toGeoJSON().geometry.coordinates[0].map(function (ary) {

                                    array.push(ary.join(' '));
                                });
                                $scope.bounds = array.reduce(
                                    (accumulator, currentValue) => accumulator.concat(currentValue),
                                    []
                                );
                                console.log($scope.bounds)

                            });
                        });
                    });



                    try {
                        $scope.imageSrc.compressed.dataUrl = res.images[0].imageLink;
                    } catch (error) {

                    }

                    // $scope.map.setCenter({lat: $scope.address.latitude, lng: $scope.address.longitude});
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

                })
                .error(function (err) {
                    console.log(err);
                });


            // $http.get(urls.GET_CATEGORY)
            // .success(function(res) {
            //     $scope.categories = res;
            // })
            // .error(function(err) {
            //     console.log(err);
            // });
        }

        init();

        $scope.removeTags = function (index) {
            console.clear()
            supportTagsArray = $scope.tagsArray.slice(index + 1, $scope.tagsArray.length)
            $scope.tagsArray = supportTagsArray
        }

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

        $scope.getSubCategory = function () {
            var st = $scope.address.category.type.toString();
            $http.get(urls.GET_SUB_CATEGORY + st)
                .success(function (res) {
                    $scope.subcategories = [];

                    res.map(function (st) {
                        $scope.subcategories.push({
                            key: st.id,
                            name: st.subtype
                        })
                    });

                })
                .error(function (err) {
                    console.log(err);
                });
        };


        // $scope.address.road_type = [];

        // $scope.onRoadSelect = function(selectedItem) {
        //     $scope.address.road_type = selectedItem;

        // };

        // $scope.onSubTypeSelect = function(selectedItem) {
        //     $scope.address.sub_type = selectedItem;

        // };


        $scope.add_place = function (referenceId) {

            console.log('tags: ', supportTagsArray)

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

            // console.log("subarea " + tempSubarea);

            var tempSuparea;
            try {
                tempSuparea =
                    $scope.address.super_sub_area.match(rex) != null ?
                    "" + $scope.address.super_sub_area + ", " :
                    "";
            } catch (e) {
                tempSuparea = "";
            }
            // console.log("suparea " + tempSuparea);

            var tempHouse;
            try {
                tempHouse =
                    $scope.address.house.match(rex) != null ?
                    "House " + $scope.address.house + ", " :
                    "";
            } catch (e) {
                tempHouse = ""
            }

            // console.log("house " + tempHouse);

            var tempFloor = null;

            try {
                tempFloor =
                    $scope.address.floor.match(rex) != null ?
                    $scope.address.floor :
                    "";

                if ($scope.address.floor.match(rex) !== null) {
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
                if (reg.test($scope.address.road) && $scope.address.road.length <= 5) {
                    tempRoad = "Road " + tempRoad;
                    $scope.address.road = "Road " + $scope.address.road
                }
                if (rexFloor.test($scope.address.road)) {
                    tempRoad = "Road " + tempRoad;
                    $scope.address.road = "Road " + $scope.address.road
                } else {
                    tempRoad = tempRoad;
                }

            } catch (e) {
                tempRoad = ""
            }



            // tempRoad = reg.test($scope.address.road) ? "Road " + tempRoad : tempRoad;
            // console.log("road " + tempRoad);

            var tempAddress;
            try {
                tempAddress =
                    $scope.address.name.match(rex) != null ?

                    $scope.address.name +
                    ", " +
                    tempFloor +
                    tempBuildingName +
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
            // console.log(tempAddress);
            tempAddress.replace(/(^\s*)|(\s*$)/gi, "");
            tempAddress = tempAddress.replace(/[ ]{2,}/gi, " ");
            tempAddress = tempAddress.replace(/[ ],/gi, ",");
            tempAddress = tempAddress.replace(/\n /, "\n");
            // console.log(tempAddress);


            function _setTag() {

                console.clear()

                try {

                    console.log('tunnel tag  ', DataTunnel.get_tag())
                    console.log('supparray length', supportTagsArray.length)

                    if (supportTagsArray.length > 0 && DataTunnel.get_tag() !== undefined) {

                        console.log('suppport + tunnel');
                        let tunnelArray = DataTunnel.get_tag().split(',')
                        tunnelArray.forEach(element => {
                            supportTagsArray.push(element)
                        });
                        return supportTagsArray.toString()
                    } else if (DataTunnel.get_tag() === undefined && supportTagsArray.length === 0) {
                        console.log('all none - 0');
                        return null
                    } else if (supportTagsArray.length >= 1) {
                        return supportTagsArray.toString()
                    } 
                        
                    return DataTunnel.get_tag()
                

                } catch (err) {
                    console.log(err)
                }

            }


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
                'tags': _setTag(),
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

            // if($scope.tagsArray.length > 0) {
            //     data.tags = $scope.tagsArray.toString()
            // } else {
            //     data.tags = DataTunnel.get_tag()
            // }
            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................
            Auth.addaddress(urls.UPDATE_PLACE + $scope.address.id, data, function (res) {
                try {
                    loc.lat = $scope.markers.m1.lat;
                    loc.lng = $scope.markers.m1.lng;
                    $rootScope.$broadcast("mk-upd", loc);
                    $scope.tagArray = []
                } catch (e) {
                    console.clear()
                }
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    // swal('updated');
                }, 1000);
                $scope.bounds = null;
                // $rootScope.$broadcast("mk-new", data); 
                swal("Success", res)
            }, function (error) {
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal(error);
                }, 1000);
            })
        };



        $scope.onSelect = function (user) {
            $scope.selected = user;
            // console.log('update place modal', user.tags);
            setValue(["city", "area", "postCode", "name", "house", "road", "sub_area", "super_sub_area", "Address"], "");

            $scope.markers.m1.lat = parseFloat($scope.selected.latitude);
            $scope.markers.m1.lng = parseFloat($scope.selected.longitude)
            $scope.center.lat = parseFloat($scope.selected.latitude);
            $scope.center.lng = parseFloat($scope.selected.longitude);
            DataTunnel.set_form_data(user);
            $scope.address.id = user.id;
            $scope.address.Address = user.Address;
            $scope.address.city = user.city;
            $scope.address.area = user.area;
            $scope.address.postCode = user.postCode;
            $scope.pview = user.pType;
            $scope.sub_view = user.subType;
            $scope.pType = user.pType;
            $scope.subType = user.subType;
            // var tag = user.tags;
            // if (tag !== null) $scope.tagsArray = tag.split(',');

            var type = {
                'pType': user.pType,
                'subType': user.subType
            }
            DataTunnel.address_split($scope.address, user.Address, type);
            // $scope.address.Address = user.Address;
            // $scope.address.latitude = user.latitude;
            // $scope.address.longitude = user.longitude;
            // $scope.address.number_of_floors = user.number_of_floors,
            // $scope.address.road_details = user.road_details;

            console.log('tags', $scope.address.tags);


            $http.get(urls.SEARCH_CODE + user.uCode)
                .success(function (res) {
                    console.log(res['ST_AsGeoJSON(bounds)'])
                    $scope.bounds = JSON.parse(res['ST_AsGeoJSON(bounds)']);
                    var bounds = JSON.parse(res['ST_AsGeoJSON(bounds)']);
                    var tempBound = [];
                    $scope.bounds.coordinates[0].map(function (ary) {

                        tempBound.push(ary.join(' '));
                    });
                    $scope.bounds = tempBound.reduce(
                        (accumulator, currentValue) => accumulator.concat(currentValue),
                        []
                    );
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
                })
        };
        $scope.users = function (userName) {
            if (userName.length < 1) {
                return [];
            }
            $scope.loading = true;
            return Auth.getUsers(userName).then(function (data) {
                $scope.loading = false;
                //$scope.markers = addressPointsToMarker(data.places);
                console.log(data.places);
                return data.places;
            }, function (status) {
                $scope.loading = false;
                //$rootScope.error = 'Failed to fetch data';
                $timeout(function () {
                    bsLoadingOverlayService.stop({
                        referenceId: 'first'
                    });
                    swal($rootScope.error);
                    $scope.markers.m1 = {};
                }, 2000);
            });
        };

        $scope.auto_fill_form = function () {
            var user = DataTunnel.get_form_data();
            console.log(user);
            $scope.address.city = user.city;
            $scope.address.area = user.area;
            $scope.address.postCode = user.postCode;
            $scope.address.Address = user.Address;
            $scope.address.latitude = user.latitude;
            $scope.address.longitude = user.longitude;
            $scope.address.number_of_floors = user.number_of_floors,
                $scope.address.road_details = user.road_details;
        }

        $scope.set_marker_position = function (mlatlng) {
            var mlat = mlatlng.split(',')[0];
            var mlng = mlatlng.split(',')[1];
            $scope.center.lat = parseFloat(mlat);
            $scope.center.lng = parseFloat(mlng);
            reverse_geo($scope.center.lat, $scope.center.lng)

        }

        console.clear()
        console.log(loc)

        $scope.ok = function() {
          $modalInstance.close();
      };
    }

}());