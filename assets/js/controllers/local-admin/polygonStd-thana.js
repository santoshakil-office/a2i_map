(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('LocalPolygonStdThana', LocalPolygonStdThana);

    LocalPolygonStdThana.$inject = ['$scope', '$modal', '$http', '$stateParams', '$window', '$location', '$timeout', 'leafletData', 'urls', 'Auth', 'DataTunnel', 'bsLoadingOverlayService'];

    function LocalPolygonStdThana($scope, $modal, $http, $stateParams, $window, $location, $timeout, leafletData, urls, Auth, DataTunnel, bsLoadingOverlayService) {
        // $scope.coordinates=[];
        $scope.dynamicIconSize = [25, 25]

        var addressPointsToMarkers = function(points) {
            return points.map(function(ap, idx) {
               var icon = './assets/img/dot.png';
              
              return {
                layer: 'udc',
                id : idx,
                div: ap[0],
                dis: ap[1],
                subdis: ap[2],
                uni: ap[3],
                lat : parseFloat(ap[5]),
                lng : parseFloat(ap[6]),
                focus : true,
                message :"<div ng-include src=\"'views/marker-popup.html'\"></div>",
                icon : {
                  iconUrl: icon,
                  // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: $scope.dynamicIconSize,
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                }
              };
            });
   };

        $scope.division_logistics_data = {
            'company_data' : [
                {
                    'company_title': 'Biddyut Limited ',
                    'contact_no' : '016XXXXXXXX',
                    'email': 'logistics@Biddyut',
                    'company_type': 'general',
                
                },

                {
                    'company_title': 'PROKRITI INC',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@prokriti',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Mingle Limited ',
                    'contact_no' : '018XXXXXXXX',
                    'email': 'logistics@Mingle ',
                    'company_type': 'general',
                },

                {
                    'company_title': 'ekshop.gov.bd',
                    'contact_no' : '015XXXXXXXX',
                    'email': 'logistics@ekshop.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'eCourier Ltd',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@eCourier.com',
                    'company_type': 'general',
                },
                
                {
                    'company_title': 'Truck Lagbe Ltd',
                    'contact_no' : '019XXXXXXXX',
                    'email': 'logistics@Trucklagbe.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Trendy Tracker',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@Trendytracker.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Amar Bazar',
                    'contact_no' : '013XXXXXXXX',
                    'email': 'logistics@Amar Bazar',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Pathao Next-Day',
                    'contact_no' : '016XXXXXXXX',
                    'email': 'logistics@pathao.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'RedX',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@RedX.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Daraz',
                    'contact_no' : '016XXXXXXXX',
                    'email': 'logistics@Daraz.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Paperfly',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@ppfly.com',
                    'company_type': 'general',
                },
            

            ],
            
            'district_cover': [
                "all"
            ]
        }

        $scope.dhaka_logistics_data = {
            'company_data' : [
                {
                    'company_title': 'Chaldal.com ',
                    'contact_no' : '016XXXXXXXX',
                    'email': 'logistics@Chaldal.com',
                    'company_type': 'general',
                
                },

                {
                    'company_title': 'sindabad.com',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@sindabad.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Cookups Technologies Ltd.  ',
                    'contact_no' : '018XXXXXXXX',
                    'email': 'logistics@Cookups.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'PoshaPrani.com',
                    'contact_no' : '015XXXXXXXX',
                    'email': 'logistics@PoshaPrani.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'Pickaboo',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@Pickaboo.com',
                    'company_type': 'general',
                },
                
                {
                    'company_title': 'Truck Lagbe Ltd',
                    'contact_no' : '019XXXXXXXX',
                    'email': 'logistics@Trucklagbe.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'petbangla.com',
                    'contact_no' : '017XXXXXXXX',
                    'email': 'logistics@petbangla.commands',
                    'company_type': 'general',
                },

                {
                    'company_title': 'PriyoShop Ltd',
                    'contact_no' : '013XXXXXXXX',
                    'email': 'logistics@PriyoShop.com',
                    'company_type': 'general',
                },

                {
                    'company_title': 'The Mall Ltd',
                    'contact_no' : '016XXXXXXXX',
                    'email': 'logistics@Mall.com',
                    'company_type': 'general',
                },

            ],
            
            'district_cover': [
                "Dhaka"
            ]
        }



        $scope.district_wise_data = [
            {
                'company_title': 'Pathao Inc.',
                'contact_no' : '016XXXXXXXX',
                'email': 'logistics@pathao',
                'company_type': 'general',
                'district_cover': [
                    "Ruma, Bandarban", "Rangunia, Chittagong", "Bagha, Rajshahi"
                ]
            },

            {
                'company_title': 'Paper Fly.',
                'contact_no' : '017XXXXXXXX',
                'email': 'logistics@ppfly',
                'company_type': 'general',
                'district_cover': [
                    "Bhairab, Kishoreganj", "Chhatak, Sunamganj", "Hatiya, Noakhali"
                ]
            }
        ]

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
                    if(!isNaN(parseFloat(arrMatches[3]))){
                      arrMatches[3] = parseFloat(arrMatches[3]);
                    }
                    strMatchedValue =  arrMatches[3];
                }

                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            return arrData;
        }


        function deleteRow(arr, row) {
          arr = arr.slice(0); // make copy
          arr.splice(row - 1, 1);
          return arr;
        }



        var init = function () {


            Auth.getlocations('./data/subdistricts_new.csv', function (text) {
                    $scope.district_list = csvToArray(text, ",")
                    $scope.district_list = deleteRow($scope.district_list, 1)
                    $scope.district_list = deleteRow($scope.district_list, $scope.district_list.length)
                    // console.log($scope.district_list)

                },
                function () {

                });

            Auth.getlocations('./data/division_new.csv', function (text) {
                    $scope.division_list = csvToArray(text, ",")
                    $scope.division_list = deleteRow($scope.division_list, 1)
                    $scope.division_list = deleteRow($scope.division_list, $scope.division_list.length)

                },
                function () {

                });
            

            Auth.getlocations('./data/only_dhaka.csv', function (text) {
                    $scope.dhaka_list = csvToArray(text, ",")
                    $scope.dhaka_list = deleteRow($scope.dhaka_list, 1)
                    $scope.dhaka_list = deleteRow($scope.dhaka_list, $scope.dhaka_list.length)

                },
                function () {

                });

            Auth.getlocations('./data/udc.csv', function (text) {
                    $scope.udc_points = csvToArray(text, ",")
                    $scope.udc_points = deleteRow($scope.udc_points, 1)
                    $scope.udc_points = deleteRow($scope.udc_points, $scope.udc_points.length)
                    // console.log($scope.udc_points)
                    $scope.markers = addressPointsToMarkers($scope.udc_points)

                },
                function () {

                });

            // Auth.getlocations(urls.POLYGON_THANA + '?', function (res) {
            //         $scope.thanas = res;

            //     },
            //     function () {

            //     });
            Auth.getlocations('./data/provider.csv', function (text) {
                    var item_provider_list = csvToArray(text, ",")
                    item_provider_list = deleteRow(item_provider_list, 1)
                    item_provider_list = deleteRow(item_provider_list, item_provider_list.length)

                    $scope.item_provider_grouped_obj = groupBy(item_provider_list, 1)
                    // console.log($scope.item_provider_grouped_list)
                    console.clear();
                    for (const items in $scope.item_provider_grouped_obj) {
                        $scope.item_provider_grouped_obj[items].map(function(item) {
                            console.log(item[3])
                        })
                        // console.log($scope.item_provider_grouped_obj[items])
                    }
                    // $scope.markers = addressPointsToMarkers($scope.udc_points)

                },
                function () {

                });


        };
        init();


        angular.extend($scope, {
            center: {
                lat: 23.728783,
                lng: 90.393791,
                zoom: 12,

            },
            //  controls: {
            //             draw: {},
            //             edit: {
            //     featureGroup: drawnItems, //REQUIRED!!
            //     remove: false
            // }
            //         },
            layers: {
               baselayers: {

                    
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        layerOptions: {
                            maxZoom: 23
                        },
                    },

                },
                overlays: {
                    
                    udc: {
                        name: 'udc',
                        type: 'group',
                        visible: false
                    },

                }
            }
        });

        $scope.Feature = []
        let baseAreaDrawed = false

        leafletData.getMap().then(function (map) {
            $timeout(function () {
                map.invalidateSize();
                //create bounds
            }, 500);
            

         
            

        });

        $scope.$on("leafletDirectiveMarker.click", function(event, args) {
            DataTunnel.set_data(args.model)
        });

      
        function onEachFeature(feature, layer) {
            layer.bindTooltip(feature.properties.name, {permanent:true,direction:'center',className: 'countryLabel'});
        }


        function getColor() {
            var o = Math.round,
                r = Math.random,
                s = 255;
            return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
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


        $scope.set_thana = function (tn) {


            Auth.getlocations(urls.POLYGON_THANA + '/'+ tn.id , function (res) {

                    let thana = res[0];
                    DataTunnel.set_data(thana);

                    // $scope.FeatureReady = []
                var coordinates = [];
                var temp = []
                var polyjsonLayer = JSON.parse(thana['ST_AsGeoJSON(geom)']);
                console.log(polyjsonLayer)
                var polyjson = JSON.parse(thana['ST_AsGeoJSON(geom)']);
                

                temp.push(polyjson.coordinates);
                coordinates = temp;
          


                //AKhane problem may be
                // console.log(polyjson.coordinates[0])
          

                    let foo = { ScopeId: $scope.zoneId, currentlyEdting: $scope.currentlyEdting, selectedPlace: `${thana.id} (${thana.thana})` }

                    console.log('in to the True')
                    console.table(foo)

                    $scope.Feature.push({
                      "type": "Feature",
                      "properties": {
                        "name": thana.thana,
                      },
                      "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": polyjson.coordinates
                      }
                    });
            
                    angular.extend($scope, {
                      center: {
                        lat: coordinates[0][0][0][0][1],
                        lng: coordinates[0][0][0][0][0],
                        zoom: 11,
            
                      },
            
                      geojson: {
                        data: {
                          "type": "FeatureCollection",
                          "features": $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                      },
            
            
                    });
            
                

                    },
                    function () {

                    });

        };


        $scope.changeCenter = function (marker) {
            $rootScope.center.lat = marker.lat;
            $rootScope.center.lng = marker.lng;
        };

        $scope.openSlide = function () {
            $scope.toggle = !$scope.toggle;
        };


        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }


        var groupBy = function(xs, key) {
              return xs.reduce(function(rv, x) {
                    if(x[key].split(',').length == 1){
                        (rv[x[key.toString().trim()]] = rv[x[key.toString().trim()]] || []).push(x);
                    }
                    else{
                        x[key].split(',').map(function(singleKey) {
                            (rv[singleKey.toString().trim()] = rv[singleKey.toString().trim()] || []).push(x);
                        })                    
                    }
                    return rv;
                    
              }, {});
        };

        $scope.$watch("center.zoom", function(zoom) {
                $scope.dynamicIconSize  = (zoom > 12)
                        ?  [25, 25]
                        : [15, 15]
        });




        $scope.select_admin_level = function() {
            console.log($scope.admin_level)
            switch ($scope.admin_level) {
                case '0':
                    
                    console.log('Hey Its Division')
                    $scope.geojson_division = []
                    $scope.geojson_district = null
                    $scope.geojson_dhaka = null


                    $scope.division_list.map(function(dl) {
                        // console.log('the geo string test')
                        // console.log(dl[1].toString())
                        let geoJsonForm = 
                        {
                          "type": "Feature",
                          "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": JSON.parse(dl[1])
                        },
                          "properties": {
                            "name": dl[0].trim()
                          }
                        }
                        console.log('GeoJson To Sring')
                        $scope.geojson_division.push(geoJsonForm)
                    })

                    
                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.geojson_division.map(function(geo_array, k) {
                        console.log('print all geo arrray')
                        var polyjson =  geo_array['geometry'];
                        // console.log(polyjson)
                        $scope.Feature.push(geo_array);



                        temp.push(polyjson.coordinates);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });

                    coordinates = temp;

                    
                    angular.extend($scope, {
                      center: {
                        lat: coordinates[2][0][0][0][1],
                        lng: coordinates[2][0][0][0][0],
                        zoom: 9,
            
                      },
            
                      geojson: {
                        data: {
                          "type": "FeatureCollection",
                          "features": $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                      },
            
            
                    });


                    break;

                case '1':
                    let all_unique_district_pairs = []
                    console.log('Hey Its Districts')

                    $scope.district_wise_data.map(function(dis_data) {
                        all_unique_district_pairs.push(dis_data.district_cover)
                    })
                    // console.log(all_unique_district_pairs.flat())
                    $scope.geojson_district = []
                    $scope.geojson_division = null
                    $scope.geojson_dhaka = null
                    all_unique_district_pairs.flat().map(function(unique_pair) {
                        $scope.district_list.find(function(dl) {
                            if(dl[0].trim().toLowerCase() == unique_pair.split(',')[0].trim().toLowerCase() && dl[1].trim().toLowerCase() == unique_pair.split(',')[1].trim().toLowerCase()){
                                    
                                console.log('the geo string test')
                                console.log(dl[2].toString())
                                let geoJsonForm = 
                                {
                                  "type": "Feature",
                                  "geometry": {
                                    "type": "MultiPolygon",
                                    "coordinates": JSON.parse(dl[2])
                                },
                                  "properties": {
                                    "name": dl[0].trim()
                                  }
                                }
                                console.log('GeoJson To Sring')
                                $scope.geojson_district.push(geoJsonForm)
                            }
                        })
                    })


                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.geojson_district.map(function(geo_array, k) {
                        console.log('print all geo arrray')
                        var polyjson =  geo_array['geometry'];
                        // console.log(polyjson)
                        $scope.Feature.push(geo_array);



                        temp.push(polyjson.coordinates);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });

                    coordinates = temp;

                    
                    angular.extend($scope, {
                      center: {
                        lat: coordinates[0][0][0][0][1],
                        lng: coordinates[0][0][0][0][0],
                        zoom: 11,
            
                      },
            
                      geojson: {
                        data: {
                          "type": "FeatureCollection",
                          "features": $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                      },
            
            
                    });

                    break;

                case '2':

                    console.log('Hey Its Dhaka')
                    $scope.geojson_division = null
                    $scope.geojson_district = null
                    $scope.geojson_dhaka = []

                    $scope.dhaka_list.map(function(dl) {
                        // console.log('the geo string test')
                        // console.log(dl[1].toString())
                        let geoJsonForm = 
                        {
                          "type": "Feature",
                          "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": JSON.parse(dl[1])
                        },
                          "properties": {
                            "name": dl[0].trim()
                          }
                        }
                        console.log('GeoJson To Sring')
                        $scope.geojson_dhaka.push(geoJsonForm)
                    })

                    
                    var coordinates = [];
                    var temp = [];
                    $scope.Feature = []
                    $scope.geojson_dhaka.map(function(geo_array, k) {
                        console.log('print all geo arrray')
                        var polyjson =  geo_array['geometry'];
                        console.log(polyjson)
                        $scope.Feature.push(geo_array);



                        temp.push(polyjson.coordinates);
                        // console.log(array.concat(polyjson.coordinates[0]));
                    });

                    coordinates = temp;

                    
                    angular.extend($scope, {
                      center: {
                        lat: coordinates[0][0][0][0][1],
                        lng: coordinates[0][0][0][0][0],
                        zoom: 11,
            
                      },
            
                      geojson: {
                        data: {
                          "type": "FeatureCollection",
                          "features": $scope.Feature
                        },
                        style: style,
                        onEachFeature: onEachFeature
                      },
            
            
                    });

                    break;

                default:
                    console.log('Nothing will Happen')
                    break;
            }
        }

        

    }

}());

