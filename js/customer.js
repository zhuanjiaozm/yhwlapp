/*
 * @Author: 疯子乔
 * @Date:   2016-11-16 09:35:23
 * @Last Modified by:   Marte
 * @Last Modified time: 2016-11-16 15:24:19
 */

var app = angular.module('app', []);
app.controller('customerCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.defaultPage = 0;
    $scope.entErprisesList = [];
    $scope.maxPage = 2;
    $scope.loadMore = function() {
        $scope.defaultPage = $scope.defaultPage + 1;
        if ($scope.defaultPage < $scope.maxPage) {
            $http.get("corporation/find.do?count=10&page=" + $scope.defaultPage)
                .success(function(response) {
                    $scope.maxPage = response.data.totalPages;
                    $scope.entErprisesList = $scope.entErprisesList.concat(response.data.content);
                    //console.log("当前用户列表是：",$scope.entErprisesList);
                });
        }
    };
}]);


app.directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
        link: function(scope, elem, attrs) {
            var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
            $window = angular.element($window);
            scrollDistance = 0;
            if (attrs.infiniteScrollDistance !==null) { //接收并返回触发加载更多的距离
                scope.$watch(attrs.infiniteScrollDistance, function(value) {
                    return scrollDistance == parseInt(value,10);
                });
            }
            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.infiniteScrollDisabled !== null) {
                scope.$watch(attrs.infiniteScrollDisabled, function(value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }
            handler = function() {
                var elementBottom, remaining, shouldScroll, windowBottom;
                windowBottom = $window.height() + $window.scrollTop(); //所选中元素展示框的高度 + 滑动条向下滑动的距离
                elementBottom = elem.offset().top + elem.height(); //页面的总长度
                remaining = elementBottom - windowBottom;
                shouldScroll = remaining <= $window.height() * scrollDistance;
                if (shouldScroll && scrollEnabled) { //达到可加载距离
                    if ($rootScope.$$phase) {
                        return scope.$eval(attrs.infiniteScroll);
                    } else {
                        if (remaining <= 50) {
                            scope.loadMore(); //在此调用加载更多的函数
                        }
                        return scope.$apply(attrs.infiniteScroll);
                    }
                } else if (shouldScroll) {
                    return checkWhenEnabled =true;
                }
            };
            $window.on('scroll', handler); //监控scroll滑动则运行handler函数
            scope.$on('$destroy', function() { //离开页面则关闭scroll与handler的绑定
                return $window.off('scroll', handler);
            });
            return $timeout((function() {
                if (attrs.infiniteScrollImmediateCheck) {
                    if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                        return handler();
                    }
                } else {
                    return handler();
                }
            }), 0);
        }
    };
}]);
