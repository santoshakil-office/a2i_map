(function () {
    "use strict";

    angular
        .module("barikoi")
        .controller("Polygon", Polygon)
        .controller("MarkerPopup", [
            "$rootScope",
            "$scope",
            "$modal",
            "urls",
            "Auth",
            "DataTunnel",
            "leafletData",
            '$timeout',
            function ($rootScope, $scope, $modal, urls, Auth, DataTunnel, leafletData, $timeout) {


                // leafletData.getMap().then(function (map) {
                //     $timeout(function () {
                //         map.invalidateSize();
                //         //create bounds
                //     }, 500);
                // });

                $scope.place = DataTunnel.get_data();
                console.log($scope.place);

                $scope.changeFlag = function () {
                    $rootScope.$broadcast("flag-cng", $scope.place);
                }

                $scope.delete_location = function () {
                    swal({
                            title: "Are you sure?",
                            // text: "You will not be able to recover this imaginary file!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, delete it!",
                            closeOnConfirm: true
                        },
                        function () {
                            Auth.delete_plc(
                                urls.DELETE_PLACE,
                                $scope.place.uCode,
                                function (res) {
                                    $rootScope.$broadcast("mk-del", $scope.place);
                                },
                                function (err) {
                                    swal("Server Error");
                                }
                            );
                        }
                    );
                };

                $scope.update_place_modal = function () {
                    console.log("upl");
                    var modalInstance = $modal.open({
                        templateUrl: "../../views/update-place.html",
                        controller: "UpdatePlaceModal",
                        size: "lg",
                        scope: $scope,
                        resolve: {
                            loc: function () {
                                return $scope.place;
                            }
                        },
                        backdrop: 'static'
                    });
                };

                $scope.retool_place_modal = function () {
                    console.log("rtl");
                    var modalInstance = $modal.open({
                        templateUrl: "../../views/dtool/retool-modal.html",
                        controller: "Retool",
                        size: "lg",
                        scope: $scope,
                        resolve: {
                            loc: function () {
                                return $scope.place;
                            }
                        },
                        backdrop: 'static'
                    });
                };

                $scope.move_to_vault = function() {
                    swal({
                        title: "Are you sure?",
                        // text: "You will not be able to recover this imaginary file!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, Move to Vault!",
                        closeOnConfirm: true
                    },
                    function() {
                        Auth.get_with_params(urls.MOVE_DATA_VAULT+$scope.place.uCode+"/0", function(res) {
                            $rootScope.$broadcast("mk-muv", $scope.place);
                        }, function(err) {
                            swal('server error')
                        }) 
                    });
                };
            }
        ]);
    Polygon.$inject = [
        "$rootScope",
        "$scope",
        "$http",
        "$stateParams",
        "$window",
        "$location",
        "$anchorScroll",
        "$timeout",
        "leafletData",
        "urls",
        "Auth",
        "DataTunnel",
        "MapGeo",
        "bsLoadingOverlayService"
    ];

    function Polygon(
        $rootScope,
        $scope,
        $http,
        $stateParams,
        $window,
        $location,
        $timeout,
        $anchorScroll,
        leafletData,
        urls,
        Auth,
        DataTunnel,
        MapGeo,
        bsLoadingOverlayService
    ) {


        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
        });

        $scope.subcategories = [{
            key: 1,
            name: "Mirpur"
        }];

        var drawnItems = new L.FeatureGroup();

        
                

        $scope.polygonAreaLeftFull = true
        $scope.polygonAreaLeftEight = false
        $scope.polygonAreaRight = false
   
   
         // toggle column
         $scope.polygonAreaCollapse = function(){
   
           console.log('im, here');
           
           if($scope.polygonAreaLeftFull) {
               $scope.polygonAreaLeftFull = false
               $scope.polygonAreaLeftEight = true
               $scope.polygonAreaRight = true
           }else{
               $scope.polygonAreaLeftEight = false
               $scope.polygonAreaRight = false
               $scope.polygonAreaLeftFull = true
           }
         }

        var init = function () {
            Auth.getlocations(
                urls.POLYGON,
                function (res) {
                    $scope.areas = res.area;
                    var coordinates = [];
                    var temp = [];
                    $scope.areas.map(function (area) {
                        var polyjson = JSON.parse(area["ST_AsGeoJSON(area)"]);
                        // console.log(polyjson);
                        temp.push(polyjson.coordinates[0]);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });
                    coordinates = temp;
                    // console.log(coordinates);

                    $scope.areas.push({
                        id: -1,
                        name: "all",
                        "ST_AsGeoJSON(area)": JSON.stringify({
                            type: "Polygon",
                            coordinates: coordinates
                        })
                    });
                },
                function () {}
            );

            $scope.subcategories = [{
                key: 1,
                name: "Mirpur"
            }];
            Auth.getlocations(
                urls.GET_SUBTYPES,
                function (res) {
                    console.log('subtype response: ', res.data)

                    $scope.subcategories = [];
                    $scope.subcategories.push({
                        key: -1,
                        name: "Clear"
                    });
                    res.map(subcat => {
                        // console.log(subcat)
                        $scope.subcategories.push({
                            key: subcat.id,
                            name: subcat.subtype
                        })
                    });
                    //console.log($scope.subcategories);


                },
                function () {}
            );



        };
        init();

        var id;
        var info;
        var addressPointsToMarkers = function (points) {
            return points.map(function (ap, i) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                }

                var icon = {
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 35],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  }
                  if (ap.subType.toLowerCase() == 'water atm') {
                    icon.iconUrl = './assets/img/type/water-atm.png'
                    icon.iconSize = [40, 46]
                    icon.popupAnchor = [6, -32]
                  } else if ($rootScope.availableIcons.includes(ap.pType.split(',')[0].toLowerCase())) {
          
                    icon.iconUrl = './assets/img/type/' + ap.pType.split(',')[0].toLowerCase() + '.png';
          
                  } else {
                    icon.iconUrl = './assets/img/type/default.png'
                  }

                info =
                    "<div><p>Address: " +
                    ap.Address +
                    "<br></p><p>Subtype: " +
                    ap.subType +
                    "<br></p><p>Code: " +
                    ap.uCode +
                    "</p></div>";

                return {
                    idx:i,
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    focus: false,
                    Address: ap.Address,
                    area: ap.area,
                    ptype: ap.pType,
                    subtype: ap.subType,
                    uCode: ap.uCode,
                    userID: ap.user_id,
                    updated_at: ap.updated_at,
                    message: "<div ng-include src=\"'views/marker-popup.html'\"></div>",
                    draggable: true,
                    icon: icon
                };
            });
        };

        var new_place_added_to_marker = function (points) {
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
                zoom: 12
            },
            events: {
                map: {
                    enable: ["moveend", "popupopen"],
                    logic: "emit"
                },
                marker: {
                    enable: ["click", "dblclick", "dragend"],
                    logic: "emit"
                }
            },
            layers: {
                baselayers: {
                    bkoi: {
                        name: "barikoi",
                        url: "http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png",
                        type: "xyz",
                        layerOptions: {
                            attribution: "Barikoi",
                            maxZoom: 23
                        }
                    },

                    mapbox_light: {
                        name: "Mapbox Streets",
                        url: "http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}",
                        type: "xyz",
                        layerOptions: {
                            apikey: "pk.eyJ1Ijoicmhvc3NhaW4iLCJhIjoiY2o4Ymt0NndlMHVoMDMzcnd1ZGs4dnJjMSJ9.5Y-mrWQCMXqWTe__0J5w4w",
                            mapid: "mapbox.streets",
                            maxZoom: 23
                        },
                        layerParams: {
                            showOnSelector: true
                        }
                    }
                },
                overlays: {
                    // draw: {
                    //     name: "draw",
                    //     type: "group",
                    //     visible: true,
                    //     layerParams: {
                    //         showOnSelector: false
                    //     }
                    // }
                    search: {
                        name: 'search',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
            }
        });

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
            map.addLayer(drawnItems);

            leafletData.getLayers().then(function (baselayers) {
                console.log(baselayers.overlays.search);
                angular.extend($scope.controls, {
                    search: {
                        layer: baselayers.overlays.search
                    }
                });
            });


            // Set the title to show on the polygon button
            L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a sexy polygon!';

            var drawControl = new L.Control.Draw({
                position: 'topleft',
                draw: {
                    // polyline: {
                    //     metric: true
                    // },
                    polygon: {
                        // allowIntersection: true,
                        // showArea: true,
                        drawError: {
                            color: '#b00b00',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: '#bada55'
                        }
                    },
                    circle: {
                        shapeOptions: {
                            color: '#662d91'
                        }
                    },
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;
                console.log(layer)
                var layer = e.layer;
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

                swal({
                    title: "Polygon Name?",
                    type: "input",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    inputPlaceholder: "Ex: Mirpur-2, Banani etc"
                }, function (inputValue) {
                    if (inputValue === false) return false;
                    if (inputValue === "") {
                        swal.showInputError("Only tagging is real!");
                        return false
                    }
                    var data = {
                        area: coordinates.toString(),
                        name: inputValue
                    }
                    Auth.post_anything(urls.POLYGON_CREATE, data, function (res) {
                        console.log(res);
                        swal("Nice!", "New Polygon Inserted ", "success");
                    }, function () {

                    })

                });

                drawnItems.addLayer(layer);
            });

            map.on('draw:edited', function (e) {
                var layer = e.layers;
                //drawnItems.addLayer(layer);
                //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                var array = [];
                console.log(layer.toGeoJSON())
                layer.toGeoJSON().features[0].geometry.coordinates[0].map(function (ary) {

                    array.push(ary.join(' '));
                });
                $scope.coordinates = array.reduce(
                    (accumulator, currentValue) => accumulator.concat(currentValue),
                    []
                );



                swal({
                        title: "Are you sure?",
                        // text: "You will not be able to recover this imaginary file!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, update Area Poligon!",
                        closeOnConfirm: false
                    },
                    function () {
                        var data = {
                            area: $scope.coordinates.toString()
                        };
                        Auth.updateSomething(
                            urls.POLYGON_UPDATE + $scope.id,
                            data,
                            function (res) {
                                swal("Done", "Area Polygon updated");
                            },
                            function () {
                                swal("Error");
                            }
                        );
                    }
                );
                // var countOfEditedLayers = 0;
                // layers.eachLayer(function(layer) {
                //   countOfEditedLayers++;
                // });
                // console.log("Edited " + countOfEditedLayers + " layers");
            });

        });


        $scope.set_area = function (area) {
            $scope.areaName = area.name;
            $scope.areaPassed = area
            // console.log('AREA: ', area);
            var polyjson = JSON.parse(area["ST_AsGeoJSON(area)"]);
            var mapp = JSON.parse(area["ST_AsGeoJSON(area)"]);
            // console.log(polyjson);
            $scope.id = JSON.parse(area["id"]);

            for (var i = polyjson.coordinates[0].length; i--;) {
                var temp = polyjson.coordinates[0][i][0];
                polyjson.coordinates[0][i][0] = polyjson.coordinates[0][i][1];
                polyjson.coordinates[0][i][1] = temp;
                // console.log("loop")
            }
            // console.log("after the loop")
            var polyline1 = L.polygon(polyjson.coordinates);
            polyline1.setStyle(MapGeo.geo_style_rand());
            drawnItems.clearLayers();
            drawnItems.addLayer(polyline1);

            angular.extend($scope, {
                center: {
                    lat: polyjson.coordinates[0][0][0],
                    lng: polyjson.coordinates[0][0][1],
                    zoom: 14,

                }
            });
            $scope.markers = {};
        };

        $scope.set_subType = function (subtype) {
            if (subtype[0] !== undefined) {
                if (subtype[0].key < 0) {
                    subtype.reverse().map(function (st) {
                        st.selected = false;
                        $scope.total = 0;
                        $scope.markers = '';
                    });
                    // angular.extend($scope, {
                    //   geojson: {
                    //     data: {
                    //       type: "FeatureCollection",
                    //       features: []
                    //     }
                    //     // style: style,
                    //   }
                    // });
                    return;
                }
            }

            console.log(subtype)
            var stName = subtype.map(st => st.name)
            console.log(stName)
            var stNameString = stName.toString()
            console.log(stNameString)
            // console.log(urls.MULTI_PLACE_BY_SUBTYPE + area + "&area" + "=" + $scope.areaName)
            bsLoadingOverlayService.start({
                referenceId: "first"
            });
            // if (area == undefined) {
            //   area = "";
            // }
            if (subtype == undefined) {
                subtype = '';
            }


            let array = [];
            let sad_af = JSON.parse($scope.areaPassed['ST_AsGeoJSON(area)']).coordinates
            console.log('sadaf ', sad_af)

            sad_af[0].map(function (ary) {

                array.push(ary.join(' '));
            });

            let areacoordinates = array.reduce(
                (accumulator, currentValue) => accumulator.concat(currentValue),
                []
            );

            console.log('dasadfs ', areacoordinates)

            Auth.get_with_params(
                urls.MULTI_PLACE_BY_SUBTYPE + stNameString + "&area" + "=" + areacoordinates,
                // "https://admin.barikoi.xyz/v1/multi/subtype?q=ATM,BANK BRANCH&area=mirpur",
                function (res) {
                    console.log(res)
                    // console.log(urls.MULTI_PLACE_BY_SUBTYPE + area + "&area" + "=" + $scope.areaName)
                    bsLoadingOverlayService.stop({
                        referenceId: "first"
                    });

                    if (res.data) {
                        // console.log('subtypeselect ',res.data)
                        $scope.total = res.data.length;
                        // console.log('milti response: ',res.data)
                        $scope.markers = addressPointsToMarkers(res.data);

                        // console.log(res.Filters)
                        $scope.labels = res.Filters.slice(0, 5)
                        $scope.dt = res.data
                        console.log('labels', $scope.labels)
                        // $scope.series = ['Series A', 'Series B'];
                        $scope.data = []


                        function counter(data, label) {
                            return res.data.filter(function (elem) {
                                return data.subType === label;
                            }).length;
                        }

                        let count = 0;
                        $scope.labels.filter(element => {
                            // $scope.dt.forEach(el => {
                            //     if( el.subType.toLowerCase() === element.toLowerCase()) 
                            //     count++
                            // })
                            $scope.dt.filter((el) => {
                                if (el.subType.toLowerCase() === element.toLowerCase())
                                    count++
                            })

                            console.log('dddlength', $scope.data.length)

                            if ($scope.data.length <= 4) {
                                $scope.data.push(count)
                            }
                            count = 0
                        });

                        console.log(counter(res.data, $scope.labels))
                        console.log('data ', $scope.data)
                    }


                },
                function () {
                    bsLoadingOverlayService.stop({
                        referenceId: "first"
                    });
                }
            );

            if (subtype.length === 0) {
                console.log('Length 0');
                $scope.total = 0;
                $scope.markers = '';
            } else {
                subtype.map(st => {
                    if (st.selected === false) {
                        $scope.total = 0;
                        $scope.markers = '';
                    }
                })
            }
        };


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
            var temp = new_place_added_to_marker(tempary)
            console.log(temp)
            $scope.markers.push(temp[0])


        });



        $scope.$on("leafletDirectiveMarker.click", function (event, args) {
            DataTunnel.set_data(args.model);
            var newHash = "elm" + args.model.id;
            if ($location.hash() !== newHash) {
                $location.hash("elm" + args.model.id);
            } else {
                $anchorScroll();
            }
        });

        $scope.$on("leafletDirectiveMarker.mouseover", function (event, args) {
            $rootScope.mhover[args.model.id] = true;
            $rootScope.mout[args.model.id] = false;
            var newHash = "elm" + args.model.id;
            if ($location.hash() !== newHash) {
                $location.hash("elm" + args.model.id);
            } else {
                $anchorScroll();
            }
        });

        $scope.$on("leafletDirectiveMarker.mouseout", function (event, args) {
            $rootScope.mhover[args.model.id] = false;
            $rootScope.mout[args.model.id] = true;
            var newHash = "elm" + args.model.id;
            if ($location.hash() !== newHash) {
                $location.hash("elm" + args.model.id);
            } else {
                $anchorScroll();
            }
        });

        $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
            var data = {
                latitude: args.model.lat,
                longitude: args.model.lng
            };

            swal({
                    title: "Are you sure?",
                    // text: "You will not be able to recover this imaginary file!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, update marker position!",
                    closeOnConfirm: false
                },
                function () {
                    Auth.updateSomething2(
                        urls.DROP_MARKER +
                        args.model.id +
                        "?longitude=" +
                        args.model.lng +
                        "&latitude=" +
                        args.model.lat,
                        function (res) {
                            swal("Done", "marker position has been updated");
                        },
                        function () {
                            swal("Error");
                        }
                    );
                }
            );
        });

        

        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };

        $scope.changeCenter = function (marker) {
            $scope.center.lat = marker.lat;
            $scope.center.lng = marker.lng;
            DataTunnel.set_data(marker);
            marker.focus = true;
        };

        leafletData.getLayers().then(function (baselayers) {
            console.log(baselayers.overlays.search);
            angular.extend($scope.controls, {
                search: {
                    layer: baselayers.overlays.search
                }
            });
        });
    }
})();