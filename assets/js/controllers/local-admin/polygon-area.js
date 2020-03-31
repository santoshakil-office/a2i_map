(function () {
    "use strict";

    angular.module("barikoi").controller("LocalPolygonArea", LocalPolygonArea);

    LocalPolygonArea.$inject = [
        "$scope",
        "$http",
        "$stateParams",
        "$window",
        "$location",
        "$timeout",
        "leafletData",
        "urls",
        "Auth",
        "DataTunnel",
        "bsLoadingOverlayService"
    ];

    function LocalPolygonArea(
        $scope,
        $http,
        $stateParams,
        $window,
        $location,
        $timeout,
        leafletData,
        urls,
        Auth,
        DataTunnel,
        bsLoadingOverlayService
    ) {

        $scope.areas = [{
            key: 1,
            name: "Mirpur"
        }];
        Auth.getlocations(
            urls.POLYGON_AREA,
            function (res) {
                $scope.selectedItems = [];
                $scope.areas = [];
                $scope.areas.push({
                    key: -1,
                    name: "clear",
                    pgon: "nai",
                    selected: false
                });
                res.map(function (res) {
                    var polyjson = res["ST_AsGeoJSON(area_area)"];
                    $scope.areas.push({
                        key: res.id,
                        name: res.area_name,
                        pgon: polyjson,
                        selected: false
                    });
                });
            },
            function () {}
        );

        $scope.toggleList = function () {
            var myEl = angular.element(document.querySelector('.dropdown-content'));
            myEl.toggleClass('show-dropdown-content');
        }

        $scope.selectOption = function (field, selectedItem) {
            // let selectedItem = new Array();

            if (selectedItem.selected === true && $scope.selectedItems.indexOf(selectedItem) === -1) {
                $scope.selectedItems.push(selectedItem);
                console.log($scope.selectedItems);
            } else if (selectedItem.selected === false) {
                $scope.selectedItems = $scope.selectedItems.filter(item => item.key !== selectedItem.key);
                console.log($scope.selectedItems);

                if ($scope.selectedItems.length === 0) {
                    angular.extend($scope, {
                        geojson: {
                            data: {
                                type: "FeatureCollection",
                                features: []
                            }
                        }
                    });
                    return;
                }
            }

            console.log($scope.selectedItems);
            console.log(field);
            if (selectedItem.key === -1) {
                $scope.selectedItems.reverse().map(function (area) {
                    area.selected = false;
                });
                angular.extend($scope, {
                    geojson: {
                        data: {
                            type: "FeatureCollection",
                            features: []
                        }
                    }
                });
                $scope.selectedItems = [];
                return;
            }

            $scope.Feature = [];
            var coordinates = [];
            var temp = [];

            $scope.id = $scope.selectedItems[$scope.selectedItems.length - 1].key;
            $scope.selectedItems.reverse().map(function (road, k) {
                var polyjson = JSON.parse(road.pgon);

                $scope.Feature.push({
                    type: "Feature",
                    properties: {
                        name: road.name,
                        key: road.key
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: polyjson.coordinates
                    }
                });

                temp.push(polyjson.coordinates);
            });
            coordinates = temp;

            if ($scope.selectedItems.length > 0) {
                angular.extend($scope, {
                    center: {
                        lat: coordinates[0][0][0][1],
                        lng: coordinates[0][0][0][0],
                        zoom: 14
                    },
                    geojson: {
                        data: {
                            type: "FeatureCollection",
                            features: $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                    }
                });
            } else {
                angular.extend($scope, {
                    geojson: {
                        data: {
                            type: "FeatureCollection",
                            features: []
                        }
                    }
                });
            }
        }


        $scope.definedLayers = {
            bkoi: {
                name: "barikoi",
                url: "http://map.barikoi.xyz:8080/styles/klokantech-basic/{z}/{x}/{y}.png",
                type: "xyz",
                layerOptions: {
                    attribution: "Barikoi",
                    maxZoom: 23
                }
            },

            mapbox_street: {
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
            },
        };

        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12
            },
            controls: {
                draw: {}
            },
            events: {
                map: {
                    enable: ["moveend", "popupopen"],
                    logic: "emit"
                }
            },
            layers: {
                baselayers: {
                    bkoi: {
                        name: "barikoi",
                        url: "http://map.barikoi.xyz:8080/styles/klokantech-basic/{z}/{x}/{y}.png",
                        type: "xyz",
                        layerOptions: {
                            attribution: "Barikoi",
                            maxZoom: 23
                        }
                    },
                    mapbox_street: {
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
                    draw: {
                        name: "draw",
                        type: "group",
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
            }
        });


        $http.get('http://map.barikoi.xyz:8080').success(function () {
            // var baselayers = $scope.layers.baselayers;
            //    if (baselayers.hasOwnProperty('bkoi')) {
            //        delete baselayers['bkoi'];
            //    }
        }).error(function () {
            var baselayers = $scope.layers.baselayers;
            if (baselayers.hasOwnProperty('bkoi')) {
                delete baselayers['bkoi'];
            }
        });

        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function (baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on("draw:created", function (e) {
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    //console.log(JSON.stringify(layer.toGeoJSON().geometry.coordinates[0]));
                    var array = [];
                    layer.toGeoJSON().geometry.coordinates[0].map(function (ary) {
                        array.push(ary.join(" "));
                    });
                    var coordinates = array.reduce(
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
                                area_area: coordinates.toString()
                            };
                            Auth.updateSomething(
                                urls.POLYGON_AREA + "/" + $scope.id,
                                data,
                                function (res) {
                                    swal("Done", "Polygon updated");
                                },
                                function () {
                                    swal("Error");
                                }
                            );
                        }
                    );
                });
            });
        });

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
        });

        function getColor() {
            var o = Math.round,
                r = Math.random,
                s = 255;
            return "rgb(" + o(r() * s) + "," + o(r() * s) + "," + o(r() * s) + ")";
            //return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
        }

        function whenClicked(e) {
            // e = event
            console.log(e.target.feature.properties.key);
            swal(e.target.feature.properties.name, "");
            $scope.id = e.target.feature.properties.key;
            // toaster.pop('success', e.target.feature.properties.name);
            // You can make your ajax call declaration here
            //$.ajax(...
        }

        function onEachFeature(feature, layer) {
            //bind click
            // layer.on({
            //     load: whenClicked,
            //     title: layer.bindPopup(feature.properties.name),
            // });
            layer.bindTooltip(feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
        }

        function style(feature) {
            return {
                fillColor: getColor(),
                opacity: 1,
                color: getColor(),
                dashArray: '3',
                fillOpacity: 0.4
            };
        }

        $scope.set_area = function (area) {
            $scope.id = area["id"];

            var coordinates = [];
            var temp = [];
            var polyjson = JSON.parse(area["ST_AsGeoJSON(area_area)"]);
            // console.log(polyjson.coordinates);
            temp.push(polyjson.coordinates);
            coordinates = temp;
            console.log(coordinates);

            //$scope.areas.push({id: -1, name:"all", 'ST_AsGeoJSON(area)': JSON.stringify({'type': "Polygon", 'coordinates': coordinates})});

            angular.extend($scope, {
                center: {
                    lat: coordinates[0][0][0][1],
                    lng: coordinates[0][0][0][0],
                    zoom: 14
                },
                geojson: {
                    data: {
                        type: "FeatureCollection",
                        features: [{
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "MultiPolygon",
                                coordinates: coordinates
                            }
                        }]
                    },
                    style: style
                }
            });
        };

        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };

        $scope.changeCenter = function (marker) {
            $scope.center.lat = marker.lat;
            $scope.center.lng = marker.lng;
        };
    }
})();