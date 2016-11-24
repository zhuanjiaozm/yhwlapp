var app = angular.module('app', []);
app.controller('orderListController', function ($scope, $filter, $q, $http, $sce) {
	if($scope.orederList == undefined){
		$scope.orederList = [];
	}
	$scope.pageSize = 3;
	$scope.currentPageNo = 1;
	$scope.search = function(){
		$http.get('order/getOrderByAddUser.do', {params:{'pageSize':$scope.pageSize, 'currentPageNo':$scope.currentPageNo, 'busNum':$scope.busNum}})
		.success(function(response) {
			//$scope.orederList = response.data;
			for(var i=0; i<response.data.length; i++){
				$scope.orederList.push(response.data[i]);
			}
			if(response.data.length == 0){
				$scope.hasMoreData = false;
			}else{
				$scope.hasMoreData = true;
			}
		}).error(function() {
			$scope.saveMsg = '连接不成功.';
		});
	};
	$scope.search();
	
	$scope.eidtOrder = function(orderId){
		window.param = {'orderId' : orderId};
		//console.info(window.param);
		window.location.href = "order.html?orderId="+orderId;
	};
	
	$scope.submit = function(orderId){
		window.param = {'orderId' : orderId};
		//console.info(window.param);
		window.location.href = "order.html";
	};
	
	$scope.toDynamic = function(orderId){
		window.param = {'orderId' : orderId};
		//console.info(window.param);
		window.location.href = "order.html";
	};
});


/*
$("#tophovertree").click(function () {
	$('body,html').animate({scrollTop:0},500);
	return false;
});
*/
function initTopHoverTree(hvtid, times, right, bottom) {
	$("#" + hvtid).css("right", right).css("bottmo", bottom);
	$("#" + hvtid).on("click", function () {goTopHovetree(times);})
	$(window).scroll(function () {
		if ($(window).scrollTop() > 268) {
			$("#" + hvtid).fadeIn(100);
		}
	});
}

//返回顶部动画
//goTop(500);//500ms内滚回顶部
function goTopHovetree(times) {
	if (!!!times) {
		$(window).scrollTop(0);
		return;
	}

	var sh = $('body,html').scrollTop();//移动总距离
	var inter = 13.333;//ms,每次移动间隔时间
	var forCount = Math.ceil(times / inter);//移动次数
	var stepL = Math.ceil(sh / forCount);//移动步长
	var timeId = null;
	function aniHovertree() {
		!!timeId && clearTimeout(timeId);
		timeId = null;
		//console.log($('body').scrollTop());
		if ($('body,html').scrollTop() <= 0 || forCount <= 0) {//移动端判断次数好些，因为移动端的scroll事件触发不频繁，有可能检测不到有<=0的情况
			$('body,html').scrollTop(0);
			return;
		}
		forCount--;
		sh -= stepL;
	    $('body,html').scrollTop(sh);
	    timeId = setTimeout(function () { aniHovertree(); }, inter);
	}
	aniHovertree();
}
$(function () { initTopHoverTree("tophovertree",500,30,20); })