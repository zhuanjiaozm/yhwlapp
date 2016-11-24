var app = angular.module('app', []);

app.config(function ($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.transformRequest = function (data) {
		if (data === undefined) {
			return data;
		}
		return $.param(data);
	}
});


app.controller('dynamicNoticeCtrl', ["$scope", "dynamicFactory", function ($scope, dynamicFactory) {

	//加载默认的数据
	loadDatas("");

	/**
	 * 搜索具体的委托单动态信息
	 */
	$scope.search = function () {

		if ($scope.businessNo == undefined || $scope.businessNo == "") {
			alert("请输入委托单号再搜索！");
			return;
		}

		loadDatas($scope.businessNo);
	};

	//加载数据方法
	function loadDatas(businessNo) {

		dynamicFactory.loadCargoDynamicInfo(businessNo).then(function (result) {

			console.log("sdfsdfsdfsdfsdfsd:", result.data);

			//添加一个当前 节点的 字段
			angular.forEach(result.data.data.pageList, function (item) {

				var currentNode = figureOutCurrentNode(item.nodeStatusValue);
				item.currentNode = parseInt(currentNode);

			});

			$scope.dynamicDatas = result.data.data.pageList;

			if ($scope.dynamicDatas.length == 0) {
				$scope.hasDatas = false;
			} else {
				$scope.hasDatas = true;
			}
			console.log("所有数据:", $scope.dynamicDatas)

		});

	}

	/**
	 * 获取最新的节点
	 * @param nodesInfo  所有节点字符串
	 */
	function figureOutCurrentNode(nodesInfo) {

		//把字符串转换为对象数组，数据库原始数据，等候处理，
		var splitDatas = nodesInfo.split(',').map(function (v) {
			var itemArr = v.split('-');
			return {
				nodeIndex: itemArr[0],
				status: itemArr[1],
			}
		});

		//获取当前节点的序号
		var curindex = 0;
		for (var i = 0; i < splitDatas.length; i++) {

			if (splitDatas[i].status != 0) {

				curindex = splitDatas[i].nodeIndex;
			}

		}

		return curindex;
	}


}]);


app.factory('dynamicFactory', function ($http) {

	return {
		loadCargoDynamicInfo: function (businessNo) {

			var args = {"businessNo": businessNo};
			var url = "dynamic/loadDynamicDatas.do";

			return $http({
				method: 'POST',
				data: args,
				url: url
			}).success(function (response, status, headers, config) {

			}).error(function (response, status, headers, config) {

				alert(status + response);

			});

		}


	};


});