(function() {
    'use strict';

    angular
        .module('barikoi')
        .directive('tagInput', function(DataTunnel) {
            return {
                restrict: 'E',
                scope: {
                    inputTags: '=taglist',
                    autocomplete: '=autocomplete'
                },
                link: function($scope, element, attrs) {
                    $scope.defaultWidth = 200;
                    $scope.tagText = '';
                    $scope.placeholder = attrs.placeholder;
                    if ($scope.autocomplete) {
                        $scope.autocompleteFocus = function(event, ui) {
                            $(element).find('input').val(ui.item.value);
                            return false;
                        };
                        $scope.autocompleteSelect = function(event, ui) {
                            $scope.$apply("tagText='" + ui.item.value + "'");
                            $scope.$apply('addTag()');
                            return false;
                        };
                        $(element).find('input').autocomplete({
                            minLength: 0,
                            source: function(request, response) {
                                var item;
                                return response((function() {
                                    var _i, _len, _ref, _results;
                                    _ref = $scope.autocomplete;
                                    _results = [];
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        item = _ref[_i];
                                        if (item.toLowerCase().indexOf(request.term.toLowerCase()) !== -1) {
                                            _results.push(item);
                                        }
                                    }
                                    return _results;
                                })());
                            },
                            focus: (function(_this) {
                                return function(event, ui) {
                                    return $scope.autocompleteFocus(event, ui);
                                };
                            })(this),
                            select: (function(_this) {
                                return function(event, ui) {
                                    return $scope.autocompleteSelect(event, ui);
                                };
                            })(this)
                        });
                    }
                    $scope.tagArray = function() {
                        if ($scope.inputTags === undefined) {
                            return [];
                        }
                        return $scope.inputTags.split(',').filter(function(tag) {
                            return tag !== "";
                        });
                    };
                    $scope.addTag = function() {
                        var tagArray;
                        if ($scope.tagText.length === 0) {
                            return;
                        }

                        tagArray = $scope.tagArray();
                        tagArray.push($scope.tagText);
                         console.log(tagArray.toString())
                          DataTunnel.set_tag(tagArray.toString())
                        $scope.inputTags = tagArray.join(',');
                        return $scope.tagText = "";
                    };
                    $scope.deleteTag = function(key) {
                        var tagArray;
                        tagArray = $scope.tagArray();
                        if (tagArray.length > 0 && $scope.tagText.length === 0 && key === undefined) {
                            tagArray.pop();
                        } else {
                            if (key !== undefined) {
                                tagArray.splice(key, 1);
                            }
                        }
                        DataTunnel.set_tag(tagArray.toString())
                        console.log(tagArray.toString())
                        return $scope.inputTags = tagArray.join(',');
                    };
                    $scope.$watch('tagText', function(newVal, oldVal) {
                        var tempEl;
                        if (!(newVal === oldVal && newVal === undefined)) {
                            tempEl = $("<span>" + newVal + "</span>").appendTo("body");
                            $scope.inputWidth = tempEl.width() + 5;
                            if ($scope.inputWidth < $scope.defaultWidth) {
                                $scope.inputWidth = $scope.defaultWidth;
                            }
                            return tempEl.remove();
                        }
                    });
                    element.bind("keydown", function(e) {
                        var key;
                        key = e.which;
                        if (key === 9 || key === 13) {
                            e.preventDefault();
                        }
                        if (key === 8) {
                            return $scope.$apply('deleteTag()');
                        }
                    }); 

                    return element.bind("keyup", function(e) {
                        var key;
                        key = e.which;
                        if (key === 9 || key === 13 || key === 188) {
                            e.preventDefault();
                            return $scope.$apply('addTag()');
                        }
                    });
                },
                template: 
                
                "<div class=''><span class='badge badge-success mr-1 mb-2 ' data-ng-repeat=\"tag in tagArray() track by $index\">{{tag}} &nbsp <i class='fa fa-times' data-ng-click='deleteTag()'></i></span><input type='text' class='form-control form-control-sm input-sm' data-ng-style='{width: inputWidth}' ng-blur = 'addTag()' data-ng-model='tagText' placeholder='Tags'/></div>"
            };
        });

}());