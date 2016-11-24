app.directive('autoComplete', function($http, $timeout, $timeout) {
    return {
        restrict: 'A',
     	templateUrl:'./template/autoComplete.html',
       	replace: true,
       	scope:{
       		requrl		: '@',	       		
       		placeholder	: '@',
       		getDate		: '&getDate',
       		reqby		: '@',
       		result		: '=',
       		ngModel		: '=',
       		showattr	: "@",
       		requireClear: '@',
       		id			: '@',
       		modelValueAs: '=',
       		defaultValue: '@',
//       		afterSelect	: "="
       			
       	}, 
       	controller:function($scope){
       		console.log("routeResultArrayNull:",$scope.routeResultArrayNull);
       	},
  		link:function(scope, element, attrs,ctrl) {	  	
  			if(!attrs.requrl){
  				console.error("指令autoComplete缺少必要参数requrl(表示查询所需请求的地址)");
  				return;
  			}
  			if(!attrs.ngModel){
  				console.error("指令autoComplete缺少必要参数ng-model(表示当前文本框需要显示出来的属性)");
  				return;
  			}
  			if(!attrs.showattr){
  				attrs.showattr = "name";
  			}
  			if(!attrs.reqby){
  				attrs.reqby = "name";
  			}
  			if(!attrs.reqattr){
  				attrs.reqattr = "name";
  			}
  			if(!attrs.modelValueAs){
  				attrs.modelValueAs = attrs.ngModel;
  			}	  			
 
  			var resultArray=[];
  			//侯选项中默契不包含清空选择
  			scope.clearitem = false;
  			//侯选项中包含清空选择
        	if(scope.requireClear == "true"){
        		scope.clearitem = true;
        	};

        	scope.toggleShowFlag = function(){
        		$timeout(function(){
        			//获取延时后的失焦事件触发时的文本框内容
        			var curInput = scope.ngModel;
        			//默认延时后的失焦事件触发时的文本框内容不在候选项中
        			var included = false;
	        		angular.forEach(resultArray, function(item){		        				        			
						if(curInput == item[scope.showattr]){
							included = true;
						}
					});
	        		if(scope.defaultValue && scope.modelValueAs && (!!curInput && !!curInput.trim())){//当需要默认值,且己设定默认值是不需要清空
	        			included = true;
	        		}
					if((included == false) && (attrs.allowUserInput == 'false')){
						scope.ngModel = "";
						scope.modelValueAs = null;
					}
					if((included == false) && (attrs.allowUserInput == 'true')){
						scope.ngModel = curInput;
					}
					scope.resultArray = [];
        		}, 100);
	    	};
	    	scope.selecetd = function(item){
	    		console.info("ddddd:"+item);
	    		scope.ngModel = item[attrs.showattr];
	    		scope.modelValueAs = item[attrs.reqattr];
				scope.resultArray = [];
//				if(angular.isFunction(scope.afterSelect)) {
//					scope.afterSelect();
//				}
	    	};
	    	scope.getData = function(keyword){
	    		console.info(keyword);
	    		if($(".routeResultArrayNull")){
        			$(".routeResultArrayNull").css("display","none");
        			console.log("结果：",$(".routeResultArrayNull"));
        		}	    			    	    		   	 	
        		if(keyword){
        			//console.log("查询的关键字是:",keyword);
               		$http.get(attrs.requrl+"?"+attrs.reqby+"_like="+keyword)
		   			.success(function(response){
		   				if(response.data.content&&response.data.content.length>0){
		   					resultArray = scope.resultArray = response.data.content;			   					
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

app.directive('datePicker', function() {
	return {
		restrict : 'A',
		require : 'ngModel',
		scope : {
			minDate : '@',
			dateFmt : '@',
			minDate : '@',
			maxDate : '@'
		},
		link : function(scope, element, attr, ngModel) {
			element.val(ngModel.$viewValue);

			function onpicking(dp) {
				var date = dp.cal.getNewDateStr();
				scope.$apply(function() {
					ngModel.$setViewValue(date);
				});
			}
			function onclearing(dp) {
//				console.info(ngModel);
				//ngModel.$viewValue = null;
				ngModel.$setViewValue("");
			}
			element.bind('click', function() {
				WdatePicker({
					onpicking : onpicking,
					'onclearing':onclearing,
					dateFmt : scope.dateFmt,
					minDate : scope.minDate,
					maxDate : scope.maxDate
				})
			});
		}
	};
});

app.directive('dateFormat', ['$filter', function($filter){
    var dateFilter = $filter('date');
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl){
            function formatter(value){
                return dateFilter(value, 'yyyy-MM-dd');//format
            }
            function parser(){
                return ctrl.$modelValue;
            }
            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);
        }
    };
}]);