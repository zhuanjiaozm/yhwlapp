var app = angular.module('app', ['ui.bootstrap']);

app.controller('orderController', function ($scope, $filter, $q, $http, $sce) {

	$scope.isopen = false;

	var orderId = getParam().orderId;
	var startPointId = getParam().startPointId;
	var endPointId = getParam().endPointId;
	if(!isEmpty(orderId)){//当为空时是新增操作
		$http.get('order/getOrderById.do', {params:{'orderId':getParam().orderId}})
		.success(function(response) {
			$scope.order = response.data;
			if($scope.order.prediVesselinfo){
				$scope.order.prediVesselinfo = new Date(Date.parse($scope.order.prediVesselinfo.replace(/-/g, "/")));
			}
			if($scope.order.offerExpiryDate){				
				$scope.order.offerExpiryDate = new Date(Date.parse($scope.order.offerExpiryDate.replace(/-/g, "/")));
			}
			$scope.order.invoicedStatusOld = $scope.order.invoicedStatus;
			if($scope.order.invoicedStatusOld == 1 || $scope.order.invoicedStatusOld == 2){
				$scope.order.invoicedStatus = true;
			}else{
				$scope.order.invoicedStatus = false;
			}
		}).error(function() {
			$scope.saveMsg = '连接不成功.';
		});
	}

	if(!$scope.order){
		$scope.order = {};
	}
	if(!$scope.order.contType){
		$scope.order.contType = '20GP';
	}
	
	if(!isEmpty(startPointId)){
		$http.get('door/find.do?id='+startPointId)
		.success(function(response) {
			if(response.data && response.data.content){
				$scope.order.startPoint = response.data.content[0];
			}
		}).error(function() {
			$scope.saveMsg = '连接不成功.';
		});
	}
	if(!isEmpty(endPointId)){
		$http.get('door/find.do?id='+endPointId)
		.success(function(response) {
			if(response.data && response.data.content){
				$scope.order.endPoint = response.data.content[0];
			}
		}).error(function() {
			$scope.saveMsg = '连接不成功.';
		});
	}
	
	$scope.queryPrice = function(){
		//console.info($scope.order);
		if($scope.order && ($scope.order.startPoint && $scope.order.startPoint.id) && ($scope.order.endPoint && $scope.order.endPoint.id)){
			if(!$scope.order.contType){
				alert('请选择柜形!');
				return ;
			}
			$http.get("price/lookup.do?startDoorId="+$scope.order.startPoint.id+"&endDoorId="+$scope.order.endPoint.id)
			.success(function(response){
				if(response.data){
					$scope.allSalePriceAmountList = response.data;
					$scope.sections =  $scope.allSalePriceAmountList[0].sections;
					if($scope.order.contType == '20GP'){
						$scope.order.allSalePriceAmount = $scope.allSalePriceAmountList[0].totalPrice20;
					}
					if($scope.order.contType == '40GP'){
						$scope.order.allSalePriceAmount = $scope.allSalePriceAmountList[0].totalPrice40;
					}
					if($scope.order.contType == '40HP'){
						$scope.order.allSalePriceAmount = $scope.allSalePriceAmountList[0].totalPrice40HQ;
					}
				}else{
//					$(".routeResultArrayNull").css("display", "block");
//					$scope.routeResultArrayNull = true;
				}	   				
			})
			.error(function(error){
				console.error(error);
			});
		}else{
			$scope.order.allSalePriceAmount = null;
		}
	};
	
	$scope.save = function(){
		var order = clone($scope.order);
//		removeKey(order);
		if(order.enterpriseByShipper && order.enterpriseByShipper.id == null){
			order.enterpriseByShipper = null;
		}
		if(order.startPoint && order.startPoint.id == null){
			order.startPoint = null;
		}
		if(order.enterpriseByConsignee && order.enterpriseByConsignee.id == null){
			order.enterpriseByConsignee = null;
		}
		if(order.endPoint && order.endPoint.id == null){
			order.endPoint = null;
		}
		if(order.prediVesselinfo != null){
//			console.info(toString.call(order.prediVesselinfo));
			order.prediVesselinfo = order.prediVesselinfo.format("yyyy-MM-dd");
//			console.info(order.prediVesselinfo);
		}
		if(order.offerExpiryDate != null){
//			console.info(toString.call(order.prediVesselinfo));
			order.offerExpiryDate = order.offerExpiryDate.format("yyyy-MM-dd");
//			console.info(order.prediVesselinfo);
		}
		if(order.invoicedStatus){
			if(order.invoicedStatusOld != 2){
				order.invoicedStatus = 1;
			}
		}else{
			if(order.invoicedStatusOld != 2){
				order.invoicedStatus = 0;
			}
		}
		
		$scope.queryPrice();
		if(order.allSalePriceAmount != $scope.order.allSalePriceAmount){
			alert('成本价有变动！');
		}
		/*$http.post('order/save1.do', {'order' : JSON.stringify(order)})
		.success(function(response) {
			if(response.errorcode == 1){
				$scope.order = response.data;
				alert('保存成功!');
				return ;
			}else{
				alert('保存失败!'+response.message);
				return ;
			}
		}).error(function() {
			alert('数据提交失败!');
		});*/
		
		$.ajax({
			url: "order/save.do",
			timeout:7000,
			type: "POST",
			data: {'order' : JSON.stringify(order)},
			dataType: "json",
			success: function(response){
				if(response.errorcode == 1){
//					$scope.order = response.data;
					alert('保存成功!');
					window.location.href = "order.html?orderId="+response.data.id;
					return ;
				}else{
					alert('保存失败!'+response.message);
					return ;
				}
			}
		});
	};
	
	$scope.$watch('order.boxCnt', function(to, from) {
		if(to == from){
			return;
		}
		if(!isPInt($scope.order.boxCnt)){
			$scope.order.boxCnt = null;
		}
	});
	
	$scope.$watch('order.arPrize', function(to, from) {
		if(to == from){
			return;
		}
		if(!isPluses($scope.order.arPrize)){
			$scope.order.arPrize = null;
		}
	});
	
	$scope.$watch('order.offerValue', function(to, from) {
		if(to == from){
			return;
		}
		if(!isPluses($scope.order.offerValue)){
			$scope.order.offerValue = null;
		}
	});
	
	$scope.$watch('order.invoicedStatus', function(to, from) {
		if(to == from){
			return;
		}
		if(!$scope.order.invoicedStatus){
			$scope.order.invoiceTitle = '';
		}
	});
	
	
	$scope.$watch('order.startPoint.id', function(to, from) {
//		console.info('aaaaaa');
//		console.info('to:'+to);
//		console.info('from:'+from);
//		console.info(to == from);
		if(to == from){
			return;
		}
		$scope.queryPrice();
	});
	$scope.$watch('order.endPoint.id', function(to, from) {
//		console.info('bbbbbb');
//		console.info('to:'+to);
//		console.info('from:'+from);
//		console.info(to == from);
		if(to == from){
			return;
		}
		$scope.queryPrice();
	});
	$scope.$watch('order.contType', function(to, from) {
		if(to == from){
			return;
		}
		$scope.queryPrice();
	});
});

//$(document).ready(function(){
//  	$(":checkbox[name='detail']").click(function(){
//        $(".detail").toggle();
//	  	if($(this).attr('checked')){
//		  	$(this).removeAttr('checked');
//		}else{
//		    $(this).attr('checked','checked');
//		}
//    });
//});