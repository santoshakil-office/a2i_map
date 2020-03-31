(function () {
    'use strict';

    angular
        .module('barikoi')
        .controller('CsvDataUploadController', CsvDataUploadController);

    CsvDataUploadController.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', '$timeout', 'Auth', 'bsLoadingOverlayService'];

    function CsvDataUploadController($rootScope, $scope, $http, $location, urls, $timeout, Auth, bsLoadingOverlayService) {

        // $scope.fileContent = ''
        // $scope.showLog = false
        // $scope.resetUpload = false

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

        $scope.init  = function () {
            $scope.fileContent = []
            $scope.newAddressLog = []
            $scope.showLog = false
            $scope.resetUpload = false
        }

        $scope.init()



        $scope.uploadCsv = function (referenceId) {

            bsLoadingOverlayService.start({
                referenceId: referenceId
            });
            $scope.showLog = true

            var order_list = csvToArray($scope.fileContent, ",");

            order_list.shift()
            order_list.pop()
            // console.log('length:', order_list.length);

            var addingData

            for (let ea in order_list) {
                let data = {
                    latitude: order_list[ea][1],
                    longitude: order_list[ea][0],
                    Address: order_list[ea][2],
                    city: order_list[ea][3],
                    area: order_list[ea][4],
                    postCode: order_list[ea][5],
                    pType: order_list[ea][6],
                    subType: order_list[ea][7],
                    contact_person_phone: order_list[ea][8],
                    email: order_list[ea][9],
                };

                // Send Data Through Auth Service.......
                // Auth Service IS Responsible for Handling Http Request and Authentication......................

                // swal("Success", "Places Added ");

            // addingData = data.Address

                Auth.addaddress(
                    urls.DTOOL_ADD_PLACE,
                    data,
                    function (res) {
                        // console.log(DataTunnel.get_data());
                        let response = JSON.parse(res)
                        console.log(response);
                        
                        
                        if(response.uCode) {
                            $scope.newAddressLog.push(data.Address)
                        }

                        if (ea == order_list.length - 1) {
                            bsLoadingOverlayService.stop({
                                referenceId: "first"
                            });
                            $scope.resetUpload = true

                            // $timeout(function () {
                                
                            //    swal("Success", `Places Added`);

                            // }, 500);
                        }
                        // return
                    },
                    function (err) {
                        console.log(err);
                        swal("Error", err);
                        $scope.fileContent = ''    
                    })

                    // $http.get('https://jsonplaceholder.typicode.com/todos/1')
                    //     .then(res => {
                    //         // console.log();

                    //         $scope.newAddressLog.push(data.Address)

                    //     if (ea == order_list.length - 1) {
                    //         $scope.resetUpload = true
                    //         $timeout(function () {
                    //             bsLoadingOverlayService.stop({
                    //                 referenceId: "first"
                    //             });
                    //             swal("Success", `Places Added`);

                    //         }, 100);
                    //     }
                    //     }, (err) => {
                    //         console.log(err);
                            
                    //     })

                // scrollToBottom()

            }
            $scope.fileContent = ''
        };
    }

}());