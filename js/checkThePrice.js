var testSrc = '';
$(document).ready(function(){
	$(".places").click(function(){
		alert($(this));
		$(this).find(".waysFlag").nextAll("span.place").fadeToggle();
		$(this).find(".waysFlag").nextAll("i.fa").fadeToggle();
 		$(this).find(".waysFlag").toggleClass("fa-caret-up");
  		$(".way").fadeToggle();
  	});
});
var app = angular.module('app', [])
	.controller('WelcomeController', function($scope,$http) {
	   	$scope.reset=function(){
	   		$scope.req={};
	   	};
	   	$scope.checkPrice=function(){
	   		if(!$scope.req||!$scope.req.startDoorId||!$scope.req.endDoorId){
	   			$('#modal').modal();
	   			console.error("无起运地或者目的地");
	   			return ;
	   		}
	   		$http.get(testSrc+"price/lookup.do?startDoorId="+$scope.req.startDoorId+"&endDoorId="+$scope.req.endDoorId)
	   		//$http.get("yhwlApp/price/lookup.do?startDoorId=1147&endDoorId=421")
	   			.success(function(response){
	   				if(response.data){
	   					$scope.routeResultArray=response.data;
	   					angular.forEach($scope.routeResultArray, function(solution){
	   						// console.log("solution:",solution);
							angular.forEach(solution.sections, function(place){
								// console.log(place);
								if("SHIP"==place.transType){
									$http.get(testSrc+"vesselVoyage/find.do?DEP_PORT_ID="+place.fromId+"&DES_PORT_ID="+place.toId)
									//$http.get("yhwlApp/vesselVoyage/find.do?DEP_PORT_ID=2386&DES_PORT_ID=2045")
									.success(function(vesselVoyageResult){
										solution.vesselVoyageResult=vesselVoyageResult.data;
									});
								}
							});
						});
	   				}else{
	   					$(".routeResultArrayNull").css("display","block");
	   					$scope.routeResultArrayNull=true;
	   				}
	   			})
				.error(function(error){
					console.error(error);
			    }); 
	   	};
	   	$scope.toggleWay=function(obj){
	   		console.log("obj:",obj);
			// $(this).find(".waysFlag").nextAll("span.place").fadeToggle();
			// $(this).find(".waysFlag").nextAll("i.fa").fadeToggle();
	 	// 	$(this).find(".waysFlag").toggleClass("fa-caret-up");
	  // 		$(".way").fadeToggle();
	   	}
	})
	.directive('autoComplete', function($http,$timeout,$timeout) {
	    return {
	        restrict: 'A',
	     	templateUrl:'./template/autoComplete.html',
	       	replace: true,
	       	scope:{
	       		requrl : '@',
	       		placeholder:'@',
	       		getDate:'&getDate',
	       		reqby:'@',
	       		result:'=',
	       		ngModel: '=',
	       		showattr:"@",
	       		requireClear:'@',
	       		id:'@',
	       		modelValueAs:'='
	       	},
	       	controller:function($scope){
	       		console.log("routeResultArrayNull:",$scope.routeResultArrayNull);
	       	},
	  		link:function(scope, element, attrs,ctrl) {
	  			console.log("ctrl:",ctrl);
	  			if(!attrs.requrl){
	  				console.error("指令autoComplete缺少必要参数requrl(表示查询所需请求的地址)");
	  				return;
	  			}
	  			if(!attrs.ngModel){
	  				console.error("指令autoComplete缺少必要参数ng-model(表示当前文本框需要显示出来的属性)");
	  				return;
	  			}
	  			if(!attrs.showattr){
	  				attrs.showattr="name";
	  			}
	  			if(!attrs.reqby){
	  				attrs.reqby="name";
	  			}
	  			if(!attrs.reqattr){
	  				attrs.reqattr="name";
	  			}
	  			if(!attrs.modelValueAs){
	  				attrs.modelValueAs=attrs.ngModel;
	  			}


	  			var resultArray=[];
	  			//侯选项中默契不包含清空选择
	  			scope.clearitem=false;
	  			//侯选项中包含清空选择
	        	if(scope.requireClear=="true"){
	        		scope.clearitem=true;
	        	};

	        	scope.toggleShowFlag=function(){
	        		$timeout(function(){
	        			//获取延时后的失焦事件触发时的文本框内容
	        			var curInput = scope.ngModel;
	        			//默认延时后的失焦事件触发时的文本框内容不在候选项中
	        			var included=false;
		        		angular.forEach(resultArray, function(item){
							if(curInput==item[scope.showattr]){
								included=true;
							}
						});
						if((included==false)&&(attrs.allowUserInput=='false')){
							scope.ngModel="";
						}
						if((included==false)&&(attrs.allowUserInput=='true')){
							scope.ngModel=curInput;
						}
						scope.resultArray=[];
	        		},100);
		    	};
		    	scope.selecetd=function(item){
		    		scope.ngModel=item[attrs.showattr];
		    		scope.modelValueAs=item[attrs.reqattr];
					scope.resultArray=[];
		    	};
		    	scope.getData = function(keyword){
		    		if($(".routeResultArrayNull")){
	        			$(".routeResultArrayNull").css("display","none");
	        			console.log("结果：",$(".routeResultArrayNull"));
	        		}
	        		if(keyword){
	        			//console.log("查询的关键字是:",keyword);
                   		$http.get(testSrc+attrs.requrl+"?"+attrs.reqby+"_like="+keyword)
			   			.success(function(response){
			   				if(response.data.content&&response.data.content.length>0){
			   					resultArray=scope.resultArray= response.data.content;
			   				}else{
			   					console.error("关键字\""+keyword+"\"查询无结果！");
			   				}

			   			})
						.error(function(error){
							console.error(error);
							return false;
					    });
                   	}
		    	};
        	}
    	};
	});
angular.bootstrap(document, ['app']);
