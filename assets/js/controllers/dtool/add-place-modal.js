(function() {
    "use strict";

    angular.module("barikoi").controller("AddPlaceModal", AddPlaceModal);

    AddPlaceModal.$inject = [
        "$rootScope",
        "$scope",
        "$http",
        "$location",
        "urls",
        "loc",
        "Auth",
        "DataTunnel"
    ];

    function AddPlaceModal(
        $rootScope,
        $scope,
        $http,
        $location,
        urls,
        loc,
        Auth,
        DataTunnel
    ) {
        $scope.address = {};
        $scope.block = "";
        $scope.house = "";
        $scope.road = "";
        $scope.sector = "";
        $scope.section = "";
        $scope.subarea = "";
        $scope.address.name = "";
        $scope.center = {};
        $scope.center.lat = 23.757087;
        $scope.center.lng = 90.39037;
        $scope.listone = "";

        var mainMarker = {
            lat: $scope.center.lat,
            lng: $scope.center.lng,
            draggable: true
        };

        angular.extend($scope, {
            center: {
                lat: 23.757087,
                lng: 90.39037,
                zoom: 13
            },
            markers: {
                m1: {
                    lat: 23.757087,
                    lng: 90.39037,
                    draggable: true,
                    icon: {}
                }
            },

            events: {
                // or just {} //all events
                map: {
                    enable: ["moveend", "popupopen", "dblclick"],
                    logic: "emit"
                },
                markers: {
                    enable: ["dragend", "moveend"],
                    logic: "emit"
                }
            }
        });

        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            $scope.markers.m1.lat = args.model.lat;
            $scope.markers.m1.lng = args.model.lng;
        });

        $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {
            console.log(args);
            var leafEvent = args.leafletEvent;

            args.model.center.lat = leafEvent.latlng.lat;
            args.model.center.lng = leafEvent.latlng.lng;
            args.model.center.zoom = 14;
            $scope.markers.m1.lat = leafEvent.latlng.lat;
            $scope.markers.m1.lng = leafEvent.latlng.lng;
        });


        $scope.subcategories = [{ key: "1", name: "tut" }];

        //Initialize Method. Getting All Category List .......................................................

        var init = function() {
            $rootScope.navone = true;
            console.log("log", loc);

            // function getLocation() {
            //     if (navigator.geolocation) {
            //         navigator.geolocation.getCurrentPosition(showPosition);
            //     } else {
            //         console.log("Nop");
            //     }
            // }

            // function showPosition(position) {
            //     $rootScope.currentlat = position.coords.latitude;
            //     $rootScope.currentlng = position.coords.longitude;
            //     $scope.address.lat = $rootScope.currentlat;
            //     $scope.address.lng = $rootScope.currentlng;
            // }
            //getLocation();

            $scope.markers.m1.lat = loc.latlng.lat;
            $scope.center.lat = loc.latlng.lat;
            $scope.markers.m1.lng = loc.latlng.lng;
            $scope.center.lng = loc.latlng.lng;

            $http
                .get(urls.GET_CATEGORY)
                .success(function(res) {
                    $scope.categories = res;
                })
                .error(function(err) {
                    console.log(err);
                });
        };
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

        //Map Event. Triggerd When Maker Is Mooved.........................................

        // $scope.pin_mooved = function(events, marker) {
        //     var pos = marker.$index;
        //     map.setCenter(map.markers[pos].getPosition());
        //     $scope.address.lat = map.markers[pos].getPosition().lat();
        //     $scope.address.lng = map.markers[pos].getPosition().lng();
        // }

        //Get All Subcategories Depending on the Category Choosen...........................................

        $scope.getSubCategory = function() {
            var st = $scope.address.category.type.toString();
            $http
                .get(urls.GET_SUB_CATEGORY + st)
                .success(function(res) {
                    $scope.subcategories = res;
                })
                .error(function(err) {
                    console.log(err);
                });
        };

        //Set Subtype value..........................................................................

        // $scope.set_subtype = function(st) {
        //     $scope.subcategory = st;
        // };

        $scope.onRoadSelect = function(selectedItem) {
            $scope.address.road_type = selectedItem;
        };

        $scope.onSubTypeSelect = function(selectedItem) {
            $scope.address.sub_type = selectedItem;
        };

        //Creates New Place..........................................................................

        $scope.add_place = function() {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            var rex = /\w*[a-zA-Z0-9]\w*/g; //alphanumeric
            //var reg = new RegExp(/^\d+$/); //onlynumeric
             var reg = new RegExp(/^\d{1,3}/); //onlynumeric
            var tempSubarea =
                $scope.subarea.toString().match(rex) != null ?
                $scope.subarea + ", " :
                "";
            var tempBlock =
                $scope.block.toString().match(rex) != null ?
                "Block " + $scope.block + ", " :
                "";
            var tempHouse =
                $scope.house.toString().match(rex) != null ?
                "House " + $scope.house + ", " :
                "";
            var tempRoad =
                $scope.road.toString().match(rex) != null ? $scope.road + ", " : "";
                if (reg.test($scope.road) && $scope.road.length <= 3) {
                    tempRoad = "Road " + tempRoad;
                }
                else{
                    tempRoad = tempRoad;
                }
            // tempRoad = reg.test($scope.road) ? "Road " + tempRoad : tempRoad;
            var tempSector =
                $scope.sector.toString().match(rex) != null ?
                "Sector " + $scope.sector + ", " :
                "";
            var tempSection =
                $scope.section.toString().match(rex) != null ?
                "Section " + $scope.section + ", " :
                "";
            var tempAddress =
                $scope.address.name.toString().match(rex) != null ?
                $scope.address.name +
                ", " +
                tempHouse +
                tempRoad +
                tempBlock +
                tempSector +
                tempSubarea :
                tempHouse + tempRoad + tempBlock + tempSector + tempSubarea;
            tempAddress = tempAddress.replace(/,\s*$/, "");
            console.log(tempAddress);

            tempAddress = tempAddress.replace(/,\s*$/, "");
            console.log(tempAddress);
            tempAddress.replace(/(^\s*)|(\s*$)/gi, "");
            tempAddress = tempAddress.replace(/[ ]{2,}/gi, " ");
            tempAddress = tempAddress.replace(/[ ],/gi, ",");
            tempAddress = tempAddress.replace(/\n /, "\n");
            console.log(tempAddress);

            var roadType = "";
            var subType = "";
            if ($scope.address.road_type) {
                var roadType = $scope.address.road_type.reduce(function(
                        accumulator,
                        currentValue
                    ) {
                        return accumulator + currentValue.name + ", ";
                    },
                    "");
                roadType = roadType.replace(/,\s*$/, "");
            }

            if ($scope.address.sub_type) {
                var subType = $scope.address.sub_type.reduce(function(
                        accumulator,
                        currentValue
                    ) {
                        return accumulator + currentValue.name + ", ";
                    },
                    "");
                subType = subType.replace(/,\s*$/, "");
            }

            var data = {
                latitude: $scope.markers.m1.lat,
                longitude: $scope.markers.m1.lng,
                Address: tempAddress,
                city: $scope.address.city,
                area: $scope.address.area,
                postCode: $scope.address.postCode,
                pType: $scope.address.category.type,
                subType: subType,
                road_details: roadType,
                flag: 1,
                tags: DataTunnel.get_tag()
            };

            console.log(data)

            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................

            Auth.addaddress(
                urls.NEW_ADDRESS,
                data,
                function(res) {
                    $timeout(function() {
                        bsLoadingOverlayService.stop({
                            referenceId: "first"
                        });
                        swal(error);
                    }, 600);
                    swal("Done", "Place Added");
                    $scope.address = null;
                },
                function() {
                    swal("Error");
                    $timeout(function() {
                        bsLoadingOverlayService.stop({
                            referenceId: "first"
                        });
                        swal(error);
                    }, 1000);
                }
            );
        };

        $scope.getdirection = function() {
            if (this.getPlace().geometry.location) {
                $scope.center.lat = this.getPlace().geometry.location.lat();
                $scope.center.lng = this.getPlace().geometry.location.lng();
                $scope.markers.m1.lat = this.getPlace().geometry.location.lat();
                $scope.markers.m1.lng = this.getPlace().geometry.location.lng();
            }
        };
    }
})();