(function() {
    "use strict";

    angular
        .module("barikoi")
        .controller("DtollPlaceAdd", DtollPlaceAdd)
        .directive("fileReader", function() {
            return {
                scope: {
                    fileReader: "="
                },
                link: function(scope, element) {
                    $(element).on("change", function(changeEvent) {
                        var files = changeEvent.target.files;
                        if (files.length) {
                            var r = new FileReader();
                            r.onload = function(e) {
                                var contents = e.target.result;
                                scope.$apply(function() {
                                    scope.fileReader = contents;
                                });
                            };

                            r.readAsText(files[0]);
                        }
                    });
                }
            };
        });

    DtollPlaceAdd.$inject = [
        "$rootScope",
        "$scope",
        "$http",
        "$location",
        "urls",
        "$timeout",
        "leafletData",
        "Auth",
        "DataTunnel",
        "bsLoadingOverlayService"
    ];

    function DtollPlaceAdd(
        $rootScope,
        $scope,
        $http,
        $location,
        urls,
        $timeout,
        leafletData,
        Auth,
        DataTunnel,
        bsLoadingOverlayService
    ) {
        var minLength = 1;
        $scope.address = {};
        $scope.center = {};
        $scope.center.lat = 23.757087;
        $scope.center.lng = 90.39037;
        $scope.address.block = "";
        $scope.address.house = "";
        $scope.address.road = "";
        $scope.address.sector = "";
        $scope.address.subarea = "";
        $scope.address.section = "";
        $scope.address.name = "";
        $scope.name = "World";
        $scope.categories = [{ id: 1, name: "Home" }, { id: 2, name: "Food" }];
        $scope.address.category = [];
        var all_subtypes = [];
        $scope.address.road_type = [];
        $scope.listone = "";

        function reverse_geo(mlat, mlong) {

            $scope.markers.m1.lat = mlat;
            $scope.markers.m1.lng = mlong;

            let paramData = {
                params: {
                    latitude: mlat,
                    longitude: mlong
                }
            };

            $http
                .get("https://admin.barikoi.xyz/v1/reverse/without/auth", paramData)
                .success(function(response) {
                    $scope.selected = response[0];
                    // $rootScope.error_message
                    $scope.address.area = response[0].area;
                    $scope.address.city = response[0].city;
                    $scope.address.postCode = response[0].postCode;
                    // if (response[0].Address.includes('House')) {
                    //     $scope.address.
                    // }
                });
            // body...
        }

        function filterItems(query) {
            return query.map(function(q) {
                return all_subtypes.filter(function(el) {
                    return el.type.toLowerCase().indexOf(q.type.toLowerCase()) > -1;
                });
            });
        }

        $scope.$watch("address.category", function() {
            $scope.subcategories = filterItems($scope.address.category).flat();
            // console.log($scope.subcategories);

            $scope.pType = $scope.address.category.reduce(function(
                    accumulator,
                    currentValue
                ) {
                    return accumulator + currentValue.type + ", ";
                },
                "");
        });

        $scope.$watch("address.subcategory", function() {
            // $scope.subcategories = filterItems($scope.address.category).flat();
            // console.log($scope.subcategories);
            $scope.subType = $scope.address.subcategory.reduce(function(
                    accumulator,
                    currentValue
                ) {
                    return accumulator + currentValue.subtype + ", ";
                },
                "");
        });

        $scope.$watch("address.road_type", function() {
            // $scope.subcategories = filterItems($scope.address.category).flat();
            // console.log($scope.subcategories);
            $scope.roadType = $scope.address.road_type.reduce(function(
                    accumulator,
                    currentValue
                ) {
                    return accumulator + currentValue.name + ", ";
                },
                "");
        });

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

            controls: {
                    draw: {},
                },

            

            events: {
                // or just {} //all events
                map: {
                    enable: ["click", "moveend", "popupopen"],
                    logic: "emit"
                },
                markers: {
                    enable: ["dragend", "moveend"],
                    logic: "emit"
                }
            },

            layers: {
                baselayers: {
                    barikoi: {
                        name: "barikoi",
                        url: "http://map.barikoi.xyz:8080/styles/osm-bright/{z}/{x}/{y}.png",
                        type: "xyz",
                        layerOptions: {
                            attribution: "Barikoi",
                            maxZoom: 23
                        }
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

                    googleTerrain: {
                        name: "Google Terrain",
                        layerType: "TERRAIN",
                        type: "google"
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
                        },
                       
                    }
            }
        });

        leafletData.getMap().then(function(map) {
            $timeout(function() {
                map.invalidateSize();
                //create bounds
            }, 1000);
        });

        $scope.$on("leafletDirectiveMap.click", function(event, args) {
            //$scope.markers.m1.lat = args.model.lat;
            //$scope.markers.m1.lng = args.model.lng;
            $scope.markers.m1.lat = args.leafletEvent.latlng.lat;
            $scope.markers.m1.lng = args.leafletEvent.latlng.lng;

            const markerLatitude =args.leafletEvent.latlng.lat;
            const markerLongitude = args.leafletEvent.latlng.lng;

           reverse_geo(markerLatitude, markerLongitude)
        });

        // $scope.$on("leafletDirectiveMap.dblclick", function(event, args) {
        //     console.log(args);
        //     var leafEvent = args.leafletEvent;

        //     args.model.center.lat = leafEvent.latlng.lat;
        //     args.model.center.lng = leafEvent.latlng.lng;
        //     args.model.center.zoom = 14;
        //     $scope.markers.m1.lat = leafEvent.latlng.lat;
        //     $scope.markers.m1.lng = leafEvent.latlng.lng;
        // });

        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            $scope.markers.m1.lat = args.model.lat;
            $scope.markers.m1.lng = args.model.lng;
        });

        //Initialize Method. Getting All Category List .......................................................

        var init = function() {
            var loc = DataTunnel.get_data();

            try {
                $scope.center.lat = loc.latlng.lat;
                $scope.center.lng = loc.latlng.lng;
                $scope.center.zoom = 14;
                $scope.markers.m1.lat = loc.latlng.lat;
                $scope.markers.m1.lng = loc.latlng.lng;
            } catch (e) {
                $scope.center.lat = 23.757087;
                $scope.center.lng = 90.39037;
                $scope.markers.m1.lat = 23.757087;
                $scope.markers.m1.lng = 90.39037;
            }

            $http
                .get(urls.GET_CATEGORY)
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

        };
        init();

        //Get All Subcategories Depending on the Category Choosen...........................................
        $scope.subcategories = [{ key: "1", name: "tut" }];
        Auth.getlocations(
            urls.GET_SUBTYPES,
            function(res) {
                $scope.subcategories = res;

                all_subtypes = $scope.subcategories;
            },
            function() {}
        );



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

                map.on('draw:deleted', function(e) {
                    var layers = e.layers;
                    layers.eachLayer(function(layer) {
                        for (var i = 0; i < $scope.savedItems.length; i++) {
                            if ($scope.savedItems[i].id == layer._leaflet_id) {
                                $scope.savedItems.splice(i, 1);
                            }
                        }
                    });
                })
            });
        });


        //Set Subtype value..........................................................................




        $scope.onSelected = function(field, selectedItem) {
            $scope.address[field] = selectedItem;
            // console.log($scope.address[field]);

            if (field == "category") {}
        };

        $scope.$on("leafletDirectiveMarker.dragend", function(event, args) {
            $scope.markers.m1.lat = args.model.lat;
            $scope.markers.m1.lng = args.model.lng;
        });

        //Creates New Place..........................................................................

        $scope.add_place = function(referenceId) {
            // bsLoadingOverlayService.start({
            //     referenceId: referenceId
            // });
            var rex = /\w*[a-zA-Z0-9]\w*/g; //alphanumeric
            // var reg = new RegExp(/^\d+$/); //onlynumeric
            var reg = new RegExp(/^\d{1,3}/); //onlynumeric
            var tempSubarea =
                $scope.address.subarea.toString().match(rex) != null ?
                "" + $scope.address.subarea + ", " :
                "";
            var subarea =
                $scope.address.subarea.toString().match(rex) != null ?
                $scope.address.subarea.toString().trim() :
                "";
            console.log("subarea " + tempSubarea);
            var tempBlock =
                $scope.address.block.toString().match(rex) != null ?
                "Block " + $scope.address.block + ", " :
                "";
            var block =
                $scope.address.block.toString().match(rex) != null ?
                "Block " + $scope.address.block.toString().trim() :
                "";
            console.log("block " + tempBlock);
            var tempHouse =
                $scope.address.house.toString().match(rex) != null ?
                "House " + $scope.address.house + ", " :
                "";
            var house =
                $scope.address.house.toString().match(rex) != null ?
                $scope.address.house.toString().trim() :
                "";
            console.log("house " + tempHouse);
            var tempRoad =
                $scope.address.road.toString().match(rex) != null ?
                $scope.address.road + ", " :
                "";
            var road =
                $scope.address.road.toString().match(rex) != null ?
                $scope.address.road.toString().trim():
                "";
                if (reg.test($scope.address.road) && $scope.address.road.length <= 3) {
                    tempRoad = "Road " + tempRoad;
                }
                else{
                    tempRoad = tempRoad;
                }


            // tempRoad = reg.test($scope.address.road) ? "Road " + tempRoad : tempRoad;
            console.log("road " + tempRoad);
            var tempSector =
                $scope.address.sector.toString().match(rex) != null ?
                "Sector " + $scope.address.sector + ", " :
                "";
                var sector =
                $scope.address.sector.toString().match(rex) != null ?
                "Sector " + $scope.address.sector.toString().trim() :
                "";
            console.log("sector " + tempSector);
            var tempSection =
                $scope.address.section.toString().match(rex) != null ?
                "Section " + $scope.address.section + ", " :
                "";
            var section =
                $scope.address.section.toString().match(rex) != null ?
                "Section " + $scope.address.section.toString().trim() :
                "";
            console.log("section " + tempSection);
            var tempAddress =
                $scope.address.name.toString().match(rex) != null ?
                $scope.address.name +
                ", " +
                tempHouse +
                tempRoad +
                tempBlock +
                tempSector +
                tempSection +
                tempSubarea :
                tempHouse +
                tempRoad +
                tempBlock +
                tempSector +
                tempSection +
                tempSubarea;

            tempAddress = tempAddress.replace(/,\s*$/, "");
            console.log(tempAddress);
            tempAddress.replace(/(^\s*)|(\s*$)/gi, "");
            tempAddress = tempAddress.replace(/[ ]{2,}/gi, " ");
            tempAddress = tempAddress.replace(/[ ],/gi, ",");
            tempAddress = tempAddress.replace(/\n /, "\n");
            console.log(tempAddress);
            var sub_area, super_sub_area;

            if (sector == "" && section == "") {
                sub_area = subarea;
                super_sub_area = block;

            }
            else {
                sub_area = sector + section;
                super_sub_area = tempBlock + subarea;
            }

            var data = {
                latitude: $scope.markers.m1.lat,
                longitude: $scope.markers.m1.lng,
                holding_no:  $scope.address.house,
                road_name_number:  $scope.address.road,
                name:  $scope.address.name,
                Address: tempAddress,
                city: $scope.address.city,
                area: $scope.address.area,
                sub_area: sub_area,
                super_sub_area: super_sub_area,
                postCode: $scope.address.postCode,
                pType: $scope.pType.replace(/,\s*$/, ""),
                subType: $scope.subType.replace(/,\s*$/, ""),
                number_of_floors: $scope.address.number_of_floors,
                email: "",
                contact_person_name: $scope.address.contact_person_name,
                contact_person_phone: $scope.address.contact_person_phone,
                tags: DataTunnel.get_tag()
            };
            try {
                data["images"] = $scope.imageSrc.compressed.dataURL.slice(
                    $scope.imageSrc.compressed.dataURL.indexOf(",") + 1
                );
            } catch (error) {
                console.log(data);
            };
            try{
                data["bounds"] = $scope.bounds.toString();
            } catch (error) {
                console.log(data);
            }
            // Send Data Through Auth Service.......
            // Auth Service IS Responsible for Handling Http Request and Authentication......................

            Auth.addaddress(
                urls.DTOOL_ADD_PLACE,
                data,
                function(res) {
                     $rootScope.$broadcast("mk-new", data); 
                    $timeout(function() {
                        bsLoadingOverlayService.stop({
                            referenceId: "first"
                        });
                    }, 600);
                    $scope.house = "";
                    $scope.address.name = "";

                    $scope.imageSrc = null;
                    $scope.subcategories = all_subtypes;
                    $scope.bounds = null;
                    swal("Success", "New Address Create");
                    // $rootScope.$broadcast("mk-new", data); 
                },
                function(error) {
                    $timeout(function() {
                        bsLoadingOverlayService.stop({
                            referenceId: "first"
                        });
                        swal(error);
                    }, 1000);
                }
            );
        };

        $scope.showOverlay = function(referenceId) {
            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            var order_list = csvToArray($scope.fileContent, ",");
            for (var ea in order_list) {
                var data = {
                    latitude: order_list[ea][1],
                    longitude: order_list[ea][0],
                    Address: order_list[ea][2],
                    city: order_list[ea][3],
                    area: order_list[ea][4],
                    postCode: order_list[ea][5],
                    pType: order_list[ea][6],
                    subType: order_list[ea][7]
                };
                console.log(data);
                // Send Data Through Auth Service.......
                // Auth Service IS Responsible for Handling Http Request and Authentication......................

                Auth.addaddress(
                    urls.DTOOL_ADD_PLACE,
                    data,
                    function(res) {
                        if (ea == order_list.length - 1) {
                            $timeout(function() {
                                bsLoadingOverlayService.stop({
                                    referenceId: "first"
                                });
                                swal("Success", "Places Added ");
                            }, 2000);
                        }
                    },
                    function() {
                        // swal("Error")
                        console.log("erro");
                    }
                );
            }
        };

        $scope.getdirection = function() {
            if (this.getPlace().geometry.location) {
                $scope.center.lat = this.getPlace().geometry.location.lat();
                $scope.center.lng = this.getPlace().geometry.location.lng();
                $scope.markers.m1.lat = this.getPlace().geometry.location.lat();
                $scope.markers.m1.lng = this.getPlace().geometry.location.lng();
            }
        };

        function csvToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = strDelimiter || ",";

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                // Delimiters.
                "(\\" +
                strDelimiter +
                "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                '(?:"([^"]*(?:""[^"]*)*)"|' +
                // Standard fields.
                '([^"\\' +
                strDelimiter +
                "\\r\\n]*))",
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
            while ((arrMatches = objPattern.exec(strData))) {
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
                    strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
                } else {
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            return arrData;
        }

        $scope.onSelect = function(user) {
            $scope.selected = user;
            // console.log(user);
            $scope.markers.m1.lat = parseFloat($scope.selected.latitude);
            $scope.markers.m1.lng = parseFloat($scope.selected.longitude);
            $scope.center.lat = parseFloat($scope.selected.latitude);
            $scope.center.lng = parseFloat($scope.selected.longitude);
            $scope.address.city = user.city;
            $scope.address.area = user.area;
            $scope.address.postCode = user.postCode;
            DataTunnel.address_split($scope.address, user.Address);
        };
        $scope.users = function(userName) {
            if (userName.length < minLength) {
                return [];
            }
            $scope.loading = true;
            return Auth.getUsers(userName).then(
                function(data) {
                    $scope.loading = false;
                    //$scope.markers = addressPointsToMarker(data.places);
                    // console.log(data.places);
                    return data.places;
                },
                function(status) {
                    $scope.loading = false;
                    //$rootScope.error = 'Failed to fetch data';
                    $timeout(function() {
                        bsLoadingOverlayService.stop({
                            referenceId: "first"
                        });
                        swal($rootScope.error);
                        $scope.markers.m1 = {};
                    }, 2000);
                }
            );
        };

        $scope.set_marker_position = function(mlatlng) {
            var mlat = mlatlng.split(',')[0];
            var mlng = mlatlng.split(',')[1];
            $scope.center.lat = parseFloat(mlat);
            $scope.center.lng = parseFloat(mlng);
            reverse_geo($scope.center.lat, $scope.center.lng)

        }
    }
})();