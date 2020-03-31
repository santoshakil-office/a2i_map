(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('PolygonStudio', PolygonStudio);
    // .directive('fileModel', ['$parse', function ($parse) {
    //     return {
    //        restrict: 'A',
    //        link: function(scope, element, attrs) {
    //           var model = $parse(attrs.fileModel);
    //             var modelSetter = model.assign;
    //             var isMultiple = attrs.multiple;

    //             element.bind('change', function() {
    //                 var values = [];
    //                 angular.forEach(element[0].files, function(item) {
    //                     console.log(item)
    //                     var value = {
    //                         // File Name 
    //                         name: item.name,
    //                         //File Size 
    //                         size: item.size,
    //                         //File URL to view 
    //                         url: URL.createObjectURL(item),
    //                         // File Input Value 
    //                         _file: item
    //                     };
    //                     values.push(value);
    //                 });
    //                 scope.$apply(function() {
    //                     if (isMultiple) {
    //                         modelSetter(scope, values);
    //                     } else {
    //                         modelSetter(scope, values[0]);
    //                     }
    //                 });
    //             });
    //        }
    //     };
    //  }]);
    PolygonStudio.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$localStorage', '$timeout', 'leafletData', 'urls', 'Auth', 'bsLoadingOverlayService'];

    function PolygonStudio($scope, $modal, $http, $stateParams, $window, $location, $localStorage, $timeout, leafletData, urls, Auth, bsLoadingOverlayService) {

        leafletData.getMap().then(function(map) {
                $timeout(function() {
                    map.invalidateSize();

                    //create bounds
                }, 500);
            });

            $scope.polygonStudioLeftFull = true
            $scope.polygonStudioLeftEight = false
            $scope.polygonStudioRight = false


                  // toggle column
      $scope.polygonStudioCollapse = function(){
        
        if($scope.polygonStudioLeftFull) {
            $scope.polygonStudioLeftFull = false
            $scope.polygonStudioLeftEight = true
            $scope.polygonStudioRight = true
        }else{
            $scope.polygonStudioLeftEight = false
            $scope.polygonStudioRight = false
            $scope.polygonStudioLeftFull = true
        }
      }

        $scope.getFileDetails = function(e) {

            $scope.files = [];
            $scope.$apply(function() {

                // STORE THE FILE OBJECT IN AN ARRAY.
                for (var i = 0; i < e.files.length; i++) {
                    $scope.files.push(e.files[i])
                }

            });
        };

        // NOW UPLOAD THE FILES.
        $scope.uploadFiles = function() {
             bsLoadingOverlayService.start({
                referenceId: 'first'
            });
            //FILL FormData WITH FILE DETAILS.
            var data = new FormData();

            var objXhr = new XMLHttpRequest();
            // objXhr.addEventListener("progress", updateProgress, false);
            // objXhr.addEventListener("load", transferComplete, false);

            objXhr.addEventListener("progress", updateProgress, false);
            for (var i in $scope.files) {
                data.append("file", $scope.files[i]);
                //     var objXhr = new XMLHttpRequest();
                // objXhr.addEventListener("progress", updateProgress, false);
                // objXhr.addEventListener("load", transferComplete, false);

                // SEND FILE DETAILS TO THE API.
                objXhr.open("POST", urls.GPX_UP, false);
                objXhr.setRequestHeader('Authorization', 'bearer ' + $localStorage.token);
                objXhr.send(data);

                if (i == $scope.files.length - 1) {
                    objXhr.addEventListener("load", transferComplete, false);
                     bsLoadingOverlayService.stop({
                                     referenceId: 'first'
                                });
                    transferComplete();

                }
            }


            // ADD LISTENERS.

        }

        function updateProgress(e) {
            if (e.lengthComputable) {
                document.getElementById('pro').setAttribute('value', e.loaded);
                document.getElementById('pro').setAttribute('max', e.total);
            }
        }

        // CONFIRMATION.
        function transferComplete(e) {
            alert("Files uploaded successfully.");
        }

        

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

        $http.get(urls.GPX_LIST).success(res => {
            bsLoadingOverlayService.start({
                referenceId: 'first'
            });
            leafletData.getMap().then(function(map) {

                res.forEach((file, idx) => {
                    var gpx = 'https://admin.barikoi.xyz/v1/get/' + file;
                    new L.GPX(gpx, { async: true, jwt: $localStorage.token })
                        .on("loaded", function(e) {
                            // if (idx == res.length - 1) {
                                 bsLoadingOverlayService.stop({
                                     referenceId: 'first'
                                });
                            // }
                            // map.fitBounds(e.target.getBounds());
                        })
                        .addTo(map);
                    
                });

            });
        }).error(err => {
            bsLoadingOverlayService.stop({
                referenceId: 'first'
            });
        })

        var id;
        var info;
        var addressPointsToMarkers = function(points) {
            return points.map(function(ap) {
                if (isNaN(ap.latitude) || isNaN(ap.longitude)) {
                    console.log(ap.latitude, ap.longitude);
                    ap.latitude = 23.2433323;
                    ap.longitude = 90.02433323;
                };

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
                
                info = '<div><p>Address: ' + ap.Address + '<br></p><p>Subtype: ' + ap.subType + '<br></p><p>Code: ' + ap.uCode + '</p></div>';
                
                return {
                    id: ap.id,
                    lat: parseFloat(ap.latitude),
                    lng: parseFloat(ap.longitude),
                    focus: false,
                    message: info,
                    userID: ap.user_id,
                    updated_at: ap.updated_at,
                    draggable: false,
                    icon: icon
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

                    swal({
                        title: "Polygon Name?",
                        type: "input",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        inputPlaceholder: "Ex: Mirpur-2, Banani etc"
                    }, function(inputValue) {
                        if (inputValue === false) return false;
                        if (inputValue === "") {
                            swal.showInputError("Only tagging is real!");
                            return false
                        }
                        var data = {
                            area: coordinates.toString(),
                            name: inputValue
                        }
                        Auth.post_anything(urls.POLYGON_CREATE, data, function(res) {
                            console.log(res);
                            swal("Nice!", "New Polygon Inserted ", "success");
                        }, function() {

                        })

                    });
                });
            });
        });


        $scope.changeCenter = function(marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };

        $scope.$on("$destroy",function(){
            bsLoadingOverlayService.stop({
                 referenceId: 'first'
            });
        });


    }

}());