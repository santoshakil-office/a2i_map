(function () {

    'use strict';

    angular.module('barikoi')
        .factory('DataTunnel', ['$rootScope', '$http', '$localStorage', 'urls', function ($rootScope, $http, $localStorage, urls) {
            var data = {};
            var address_format = [/house/i, /flat/i, /road/i, /Lane/i, /avenue/i, /sharani/i, /sarani/i, /shorok/i, /sorok/i, /sarak/i, /chowrasta/i, /highway/i, /block/i, /section/i, /sector/i, /janapath/i];
            var set_data = function (ride) {
                data = ride;
            };

            var set_tag = function (tag) {
                data.tag = tag;
            };

            var set_form_data = function (fd) {
                data.form_data = fd;
                console.log(fd)
            };

            var get_data = function () {
                return data;
            };

            var get_tag = function () {
                return data.tag;
            };

            var get_form_data = function () {
                return data.form_data;
            };

            

            const isFloor = (floor) => {
                try {
                    var floor = floor.toLowerCase()
                    return floor.includes('floor') || floor.includes('level') || floor.includes('ground floor')
                } catch (e) {
                    return false;
                }
            }

            const hasNumber = (myString) => {
                try {
                    return /\d/.test(myString);
                } catch (e) {
                    return false;
                }
            }

            const ishouse = (house) => {
                try {
                    var house = house.toLowerCase();
                    return hasNumber(house) && house.includes('house') || house.includes('plot');
                } catch (e) {
                    return false;
                }
            };

            const isBuilding = (market) => {

                try {
                    var pType = market.pType.toLowerCase().toString()
                    var subType = market.subType.toLowerCase().toString()
                    return pType.includes('residential') || subType.includes('market') || 
                        subType.includes('commercial building') || subType.includes('baazar') ||
                        subType.includes('shopping mall') || subType.includes('shopping center') ||
                        subType.includes('shopping complex') || subType.includes('mall')
                } catch (e) {
                    return false;
                }
            }


            const isShop = (floor) => {
                try {
                    var floor = floor.toLowerCase()
                    return floor.includes('shop') || floor.includes('shop no');
                } catch (e) {
                    return false;
                }
            }

            const isBuildingString = (string) => {
                var string = string.toLowerCase()
                try {
                    return string.includes('shopping mall') || string.includes('shopping center') ||
                        string.includes('shopping complex') || string.includes('market') ||
                        string.includes('mohol') || string.includes('mahol') || string.includes('kutir') ||
                        string.includes('bhaban') || string.includes('bhabhan') || string.includes('vaban') ||
                        string.includes('monjil') || string.includes('manjil') || string.includes('nibash') ||
                        string.includes('nibash') || string.includes('complex') || string.includes('heights') ||
                        string.includes('abash') || string.includes('plaza') 
                } catch (e) {
                    return false

                }
            }

            const isroad = (road) => {
                try {
                    var road = road.toLowerCase();
                    return road.includes('road') || road.includes('avenue') || road.includes('highway') 
                    || road.includes('street') || road.includes('lane') || road.includes('sarani') 
                    || road.includes('saroni') || road.includes('sarak') || road.includes('sharak') 
                    || road.includes('goli') || road.includes('gali') || road.includes('sharani') 
                    || road.includes('chowrasta') || road.includes('janapath') || road.includes('path');
                } catch (e) {
                    return false;
                }

            }

            const isAvenue = (avenue) => {
                try {
                    var avenue = avenue.toLowerCase();
                    return avenue.includes('avenue') || avenue.includes('sharani') || avenue.includes('sarani')
                    || avenue.includes('sharak') || avenue.includes('sarak')
                } catch (e) {
                    return false;
                }
            }

            var latkey = 'latitude';
            var lonkey = 'longitude';
            var ucodekey = 'uCode';
            var addresskey = 'Address';
            var namekey = 'name';
            var housekey = 'house';
            var roadkey = 'road';
            var ssareakey = 'super_sub_area';
            var subareakey = 'sub_area';
            var buildingkey = 'section';
            var floorkey = 'floor';
            var areakey = 'area';
            var house_nokey = 'house_no';
            var road_idkey = 'road_id';
            var area_idkey = 'area_id';

            // 'number_of_floors' used for floor
            // 'section' used for market/building name

            var address_split = (scope_address, add, type) => {
                console.clear()
                console.log('here in the tunnel')
                console.table(scope_address);

                // var d = {};

                var houseIndex = null
                var roadIndex = null
                var houseValue = ''
                var roadValue = ''
                var buildingValue = null
                var avenue_road = false


                var splitAddress = add.split(',');

                console.log('splited: ', splitAddress)
                scope_address[buildingkey] = ''


                splitAddress.forEach(element => {

                    if (ishouse(element)) {

                        houseIndex = splitAddress.indexOf(element)
                        var ret = element
                        ret = ret.replace('House ', '');
                        houseValue = ret

                        // var str = element.trim()
                        // var houseValueNoSpace = str.split(" ")
                        // houseValue = houseValueNoSpace[1]

                    }
                    if(!avenue_road) {
                        if (isroad(element)) {
                            console.log('is road ', element);
                            
                            
                            roadIndex = splitAddress.indexOf(element)
                            roadValue = element
                            
                            scope_address[roadkey] = roadValue
    
                            if (isAvenue(splitAddress[roadIndex + 1])) {
                                console.log('is avenue ', splitAddress[roadIndex + 1])
    
                                let avenue = ''
                                avenue = splitAddress[roadIndex + 1]
    
                            roadValue = roadValue + ',' + avenue

                            avenue_road = true
    
                            }
    
                        }
                    }
                    

                    if (isFloor(element)) {
                        scope_address[floorkey] = element
                    } 

                    // if (isBuildingString(element)) {
                    //     scope_address[buildingkey] = element
                    // }

                })

                console.log(houseIndex)
                console.log(houseIndex)
                // console.log(roadValue)

                var buildingStat = roadIndex - houseIndex

                // checking if place is a building from checking subType

                if (isBuilding(type)) {

                    //if house exist
                    if (houseIndex) {
                        console.log('house found');

                        buildingStat = houseIndex - 1
                    }
                    //if road exist
                    else if (roadIndex) {
                        console.log('road found');

                        buildingStat = roadIndex - 1
                    }
                }


                // IF 2 ITEM IN ARRAY

                // IF 2 ITEM IN ARRAY w/o ROAD w/o HOUSE
                if (splitAddress.length === 2 && houseIndex === null && roadIndex === null) {
                    // scope_address[namekey] = splitAddress[0]
                    scope_address[housekey] = ''
                    scope_address[roadkey] = ''

                    if (isBuildingString(splitAddress[0]) || isBuilding(type)) {
                        scope_address[buildingkey] = splitAddress[0]
                    } else {
                        scope_address[namekey] = splitAddress[0]
                    }

                    if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else {
                        scope_address[subareakey] = splitAddress[1]
                    }

                }

                // IF 2 ITEM IN ARRAY w ROAD w HOUSE
                else if (splitAddress.length === 2 && houseIndex !== null && roadIndex !== null) {
                    scope_address[housekey] = houseValue
                    scope_address[roadkey] = roadValue
                }

                // IF 2 ITEM IN ARRAY w ROAD w/o HOUSE
                else if (splitAddress.length === 2 && houseIndex === null && roadIndex !== null) {
                    console.log('splitAddress.length === 2 && houseIndex == null && roadIndex !== null');

                    scope_address[housekey] = ''
                    scope_address[roadkey] = roadValue

                    if (isBuilding(type) || isBuildingString(splitAddress[0])) {
                        scope_address[buildingkey] = splitAddress[0]
                    } else if (isroad(splitAddress[0])) {
                        scope_address[roadkey] = splitAddress[0]
                    } else {
                        scope_address[namekey] = splitAddress[0]
                    }

                    if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else {
                        scope_address[subareakey] = splitAddress[1]
                    }
                }

                // IF 2 ITEM IN ARRAY w/o ROAD w HOUSE
                else if (splitAddress.length === 2 && houseIndex !== null && roadIndex === null) {

                    console.log('splitAddress.length === 2 && houseIndex !== null && roadIndex === null')

                    scope_address[housekey] = houseValue
                    scope_address[roadkey] = ''

                    if (isBuilding(type) && isBuildingString(splitAddress[0])) {
                        
                            scope_address[buildingkey] = splitAddress[0]

                    } else if (isroad(splitAddress[0])) {
                        scope_address[roadkey] = splitAddress[0]
                    }

                    // console.log(ishouse(scope_address[0]));

                    
                    if (ishouse(scope_address[0] == false) && !isShop(scope_address[0])) {
                        console.log('imm aa bugg');
                        
                        scope_address[namekey] = splitAddress[0]
                    }

                    if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else {
                        scope_address[subareakey] = splitAddress[1]
                    }
                }


                // IF 3 ITEM IN ARRAY w ROAD n HOUSE
                else if (splitAddress.length === 3 && houseIndex && roadIndex) {

                    console.log('splitAddress.length === 3 && houseIndex && roadIndex');


                    // if (ishouse(splitAddress[0])) {
                    //     scope_address[housekey] = splitAddress[0]
                    // }

                    if (isBuildingString(splitAddress[0]) || isBuilding(type)) {
                        scope_address[buildingkey] = splitAddress[0]
                    } else if (ishouse(splitAddress[0])) {
                        scope_address[housekey] = houseValue
                    } else {
                        scope_address[namekey] = splitAddress[0]
                    }

                    if (ishouse(splitAddress[1])) {
                        scope_address[housekey] = houseValue
                    } else if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    }

                    if (isroad(splitAddress[2])) {
                        scope_address[roadkey] = splitAddress[2]
                    } else {
                        scope_address[subareakey] = splitAddress[2]
                    }
                }

                // IF 3 ITEM IN ARRAY NO ROAD NO HOUSE
                else if (splitAddress.length === 3 && !houseIndex && !roadIndex) {

                    console.log('splitAddress.length === 3 && !houseIndex && !roadIndex')
                    // console.log('type',type);

                    if (ishouse(splitAddress[0])) {
                        scope_address[housekey] = houseValue
                    } else {

                        scope_address[namekey] = splitAddress[0]
                    }


                    if (ishouse(splitAddress[1])) {
                        scope_address[housekey] = houseValue
                    } else if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else if (isBuildingString(splitAddress[1]) || isBuilding(type)) {
                        scope_address[buildingkey] = splitAddress[1]
                    } else {
                        scope_address[name] = splitAddress[1]
                    }

                    if (isroad(splitAddress[2])) {
                        scope_address[roadkey] = splitAddress[2]
                    } else {
                        scope_address[subareakey] = splitAddress[2]
                    }

                }

                else if (splitAddress.length === 3 && !houseIndex && roadIndex) {

                    console.log('splitAddress.length === 3 && !houseIndex && roadIndex');


                    if (ishouse(splitAddress[0])) {
                        scope_address[housekey] = houseValue
                    } else if (isBuildingString(splitAddress[0]) || isBuilding(type)) {
                        scope_address[buildingkey] = splitAddress[0]
                    } else {
                        scope_address[namekey] = splitAddress[0]
                    }

                    console.log(isBuildingString(splitAddress[1]) || isBuilding(type))

                    if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else if (isBuildingString(splitAddress[1]) || isBuilding(type)) {
                        scope_address[buildingkey] = splitAddress[1]
                    }

                    if (isroad(splitAddress[2])) {
                        scope_address[roadkey] = splitAddress[2]
                    } else {
                        scope_address[subareakey] = splitAddress[2]
                    }
                }

                else if (splitAddress.length === 3 && houseIndex && !roadIndex) {

                    console.log('splitAddress.length === 3 && houseIndex && !roadIndex');

                    scope_address[roadkey] = ''

                    if (ishouse(splitAddress[0])) {
                        scope_address[housekey] = houseValue
                    } else if (isBuilding(type || isBuildingString(splitAddress[0]) && !isFloor(splitAddress[0]))) {
                        scope_address[buildingkey] = splitAddress[0]
                    } else {
                        scope_address[namekey] = splitAddress[0]
                    }

                    if (isroad(splitAddress[1])) {
                        scope_address[roadkey] = splitAddress[1]
                    } else if (ishouse(splitAddress[1])) {
                        scope_address[housekey] = houseValue
                    } else if (!isFloor(splitAddress[0]) && isBuilding(type) || isBuildingString(splitAddress[1]) ) {
                        scope_address[buildingkey] = splitAddress[1]
                    }

                    if (isroad(splitAddress[2])) {
                        scope_address[roadkey] = splitAddress[2]
                    } else {
                        scope_address[subareakey] = splitAddress[2]
                    }
                }


                // MORE THAN 3 ITEM IN ARRAY
                else {
                    console.log('MORE THAN 3 ITEM IN ARRAY')


                    // if (isFloor(splitAddress[houseIndex + 1])) {
                    //     scope_address[floorkey] = splitAddress[houseIndex + 1]
                    // }

                    // building key setup


                    scope_address[buildingkey] = scope_address[buildingStat]

                    if (buildingStat === 0) {

                        if (isBuildingString(splitAddress[buildingStat]) || isBuilding(type) && !isroad(scope_address[buildingStat]) && !ishouse(scope_address[buildingStat])) {

                            scope_address[buildingkey] = splitAddress[buildingStat]

                        } else {

                            scope_address[namekey] = splitAddress[buildingStat]
                            scope_address[buildingkey] = ''
                        }
                    } else if (buildingStat === 1) {
                        
                            scope_address[namekey] = splitAddress[0]
                        

                        if (isBuildingString(splitAddress[buildingStat]) || isBuilding(type) && !isroad(scope_address[buildingStat]) && !ishouse(scope_address[buildingStat])) {
                            scope_address[buildingkey] = splitAddress[buildingStat]

                        }
                    } else if (buildingStat === 2) {

                        scope_address[namekey] = splitAddress[0]

                        // if (isFloor(scope_address[1])) {
                        //     scope_address[floorkey] = scope_address[1]
                        // }

                        if (isBuildingString(splitAddress[buildingStat]) || isBuilding(type) && !isroad(scope_address[buildingStat]) && !ishouse(scope_address[buildingStat])) {
                            scope_address[buildingkey] = splitAddress[buildingStat]
                        }

                    }


                    // else if (buildingStat == 3) {

                    //     if (isShop(splitAddress[houseIndex + 2])) {
                    //         if (isFloor(splitAddress[houseIndex + 2])) {
                    //             scope_address[floorkey] = splitAddress[houseIndex + 2]
                    //         }
                    //         // scope_address[floorkey] = splitAddress[houseIndex + 2]
                    //     } else
                    //         scope_address[buildingkey] = splitAddress[houseIndex + 2]
                    // } else {
                    //     scope_address[buildingkey] = splitAddress[buildingStat]
                    // }


                    if (houseIndex === null && roadIndex === null) {
                        console.log('houseIndex === null && roadIndex === null');

                        if (!isShop(splitAddress[0]) && !isBuildingString(splitAddress[0]) && !isFloor(splitAddress[0]) && !isBuilding(type)) {
                            scope_address[namekey] = splitAddress[0]
                        }

                        // if (isFloor(splitAddress[1])) {
                        //     scope_address[floorkey] = splitAddress[1]
                        // }

                        // scope_address[buildingkey] = splitAddress[2]

                        if (splitAddress.length === 5) {
                            scope_address[subareakey] = scope_address[4]
                            scope_address[ssareakey] = scope_address[3]
                        } else {
                            scope_address[subareakey] = scope_address[3]
                        }

                        // console.log(indexOf(splitAddress[2]));

                        // setSubArea(indexOf(splitAddress[2]))
                    }


                    // checking for house and road existence

                    // only house & starts with house
                    else if (houseIndex !== null && houseIndex === 0 && roadIndex == null) {

                        console.log('houseIndex !== null && houseIndex === 0 && roadIndex == null')

                        scope_address[housekey] = houseValue
                        scope_address[namekey] = ''
                        scope_address[roadkey] = ''

                        setSubArea(houseIndex)

                    }



                    // only house but comes at 2nd index
                    else if (houseIndex !== null && roadIndex === null && houseIndex == 1) {

                        console.log('houseIndex !== null && roadIndex === null && houseIndex == 1')


                        scope_address[housekey] = houseValue
                        scope_address[roadkey] = ''

                        if (isBuilding(type) || isBuildingString(splitAddress[0])) {
                            scope_address[buildingkey] = splitAddress[0]
                        } else if (!isShop(splitAddress[0]) || !isFloor(splitAddress[0])) {
                            scope_address[namekey] = splitAddress[0]
                        }

                        setSubArea(houseIndex)
                    }



                    // only house but comes at 3rd index
                    else if (houseIndex !== null && roadIndex === null && houseIndex === 2) {

                        console.log('houseIndex !== null && roadIndex === null && houseIndex === 2')


                        scope_address[housekey] = houseValue
                        scope_address[namekey] = splitAddress[0]
                        scope_address[buildingkey] = splitAddress[1]
                        scope_address[roadkey] = ''

                        setSubArea(houseIndex)
                    }



                    // only road but road comes at first
                    else if (houseIndex === null && roadIndex !== null && roadIndex === 0) {

                        console.log('houseIndex === null && roadIndex !== null && roadIndex === 0')


                        scope_address[housekey] = ''
                        scope_address[namekey] = ''
                        scope_address[roadkey] = roadValue

                        setSubArea(roadIndex)
                    }



                    // only road but road comes at 2rd place or beyond
                    else if (houseIndex === null && roadIndex !== null && roadIndex >= 0) {

                        console.log('houseIndex === null && roadIndex !== null && roadIndex >= 0')

                        scope_address[housekey] = ''

                        if (isBuilding(type) || isBuildingString(splitAddress[0])) {
                            scope_address[buildingkey] = splitAddress[0]
                        } else if (!isFloor(splitAddress[0])) {
                            scope_address[namekey] = splitAddress[0]
                        }

                        scope_address[roadkey] = roadValue

                        if (roadIndex >= 2) {

                            scope_address[namekey] = splitAddress[0]
                            scope_address[buildingkey] = splitAddress[roadIndex - 1]

                        }
                        if (roadIndex >= 1) {
                            scope_address[namekey] = splitAddress[0]
                            if (isBuilding(type) || isBuildingString(splitAddress[0])) {
                                scope_address[buildingkey] = splitAddress[roadIndex - 1]
                            }
                        }

                        setSubArea(roadIndex)
                    }



                    // house and road both found
                    else if (houseIndex !== null && roadIndex !== null) {

                        scope_address[housekey] = houseValue
                        scope_address[roadkey] = roadValue

                        console.log('houseIndex !== null && roadIndex !== null')

                        if (houseIndex === 3) {

                            scope_address[namekey] = splitAddress[0]

                            if ( isBuildingString(splitAddress[2]) || isBuilding(type) && !isFloor(splitAddress[2]) ) {
                                scope_address[buildingkey] = splitAddress[2]
                            } else {
                                scope_address[buildingkey] = ''
                                scope_address[namekey] = splitAddress[0]
                            }

                            

                            // if (isBuilding(type) || isBuildingString(splitAddress[0]) && !isFloor(splitAddress[0])) {
                            //     console.log('buildingkey');
                                
                            //     scope_address[buildingkey] = splitAddress[0]
                            //     // scope_address[namekey] = ''
                            // }
                        }

                        // house not in start && not floor or shop
                        if (houseIndex === 2) {

                            scope_address[namekey] = splitAddress[0]

                            if ( isBuildingString(splitAddress[1]) || isBuilding(type) && !isFloor(splitAddress[1]) ) {
                                console.log('here');
                                scope_address[buildingkey] = splitAddress[1]
                            } else {
                                scope_address[buildingkey] = ''
                                scope_address[namekey] = splitAddress[0]
                            }

                            if (isFloor(splitAddress[1])) {
                                if(isBuildingString(splitAddress[0]) || isBuilding(type)) {
                                    scope_address[buildingkey] = splitAddress[0]
                                    scope_address[namekey] = ''
                                } 
                            } 

                            // if (isBuilding(type) || isBuildingString(splitAddress[0]) && !isFloor(splitAddress[0])) {
                            //     console.log('buildingkey');
                                
                            //     scope_address[buildingkey] = splitAddress[0]
                            //     // scope_address[namekey] = ''
                            // }

                            

                        }

                        // house is at 2nd index
                        else if (houseIndex === 1) {

                            console.log('house is at 2nd index')
                            

                            if (!isFloor(splitAddress[1]) && isBuilding(type) || isBuildingString(splitAddress[0])) {
                                scope_address[buildingkey] = splitAddress[0]

                            }
                            //  else if ( isFloor(splitAddress[0]) ) {
                            //     scope_address[floorkey] = splitAddress[0]
                            // } 
                            else if ( !isBuilding(type) || !isBuildingString(splitAddress[0]) ) {
                                scope_address[namekey] = splitAddress[0]
                            } else {
                                scope_address[namekey] = ''
                            }
                        }

                        // house is at 1st index
                        else if (houseIndex === 0) {

                            scope_address[namekey] = ''
                            scope_address[buildingkey] = ''
                        }

                        setSubArea(roadIndex)

                    }



                    //sup sub area and sub area check
                    function setSubArea(index) {
                        var test = index + 1

                        if (splitAddress.length - test > 1) {

                            scope_address[ssareakey] = splitAddress[index + 1]
                            scope_address[subareakey] = splitAddress[index + 2]

                        } else {

                            scope_address[subareakey] = splitAddress[index + 1]
                        }
                    }

                }

            }

            var get_address_string = function () {
                return data.address;
            }

            return {
                set_data: set_data,
                get_data: get_data,
                set_tag: set_tag,
                get_tag: get_tag,
                set_form_data: set_form_data,
                get_form_data: get_form_data,
                address_split: address_split,
                get_address_string: get_address_string,

                subscribe: function (scope, callback) {
                    var handler = $rootScope.$on('notifying-service-event', callback);
                    scope.$on('$destroy', handler);
                },

                publish: function () {
                    $rootScope.$emit('notifying-service-event');
                }
            };


        }]);

}());