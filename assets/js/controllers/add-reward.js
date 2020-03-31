(function() {
    'use strict';

    angular
        .module('barikoi')
        .controller('RewardAddController', RewardAddController);

    RewardAddController.$inject = ['$rootScope', '$scope', '$http', '$location', 'urls', 'Auth'];

    function RewardAddController($rootScope, $scope, $http, $location, urls, Auth) {

        $scope.data = {
             availableOptions: [
                {id: '1', name: 'bonus'},
                {id: '2', name: 'regular'},
                {id: '3', name: 'special'}
            ],
            selectedType: {id: '1', name: 'bonus'} //This sets the default value of the select in the ui
        };

        $scope.address = {};

       $scope.add_reward = function() {

            var data = {
                'rewards_name' : $scope.reward.name,
                'required_points' : $scope.reward.required_points,
                'typeOfRewards' :$scope.data.selectedType.name,
                'isOneTime' : $scope.reward.isOneTime
            }
            console.log(data);
         
            //Send Data Through Auth Service.......
            //Auth Service IS Responsible for Handling Http Request and Authentication......................

            Auth.addaddress(urls.REWARD_INFO, data, function(res) {
                    swal("Done", "New Reward Item Created");
            },function() {
                swal("Error")
            })
        };

    }

}());
