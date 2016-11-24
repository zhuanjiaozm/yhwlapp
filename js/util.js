/**
 * 常用的工具类
 * @author lvxj
 */

function isEmpty(param){
	var isEmpty = false;
	if(param == null || param == undefined || (typeof param == 'string' && param.trim() == "")){
		isEmpty = true;
	}
	if(typeof param == "array" && param.length == 0){
		isEmpty = true;
	}
	if(typeof param == "object"){
		for ( var name in param ) {
			return false;
		}
		return true;
	}
	return isEmpty;
}

function getParam(url){
	if(isEmpty(url)){
		url = location.href;
	}
	var index = url.indexOf('?');
	if(index == -1){
		return {};
	}
	var queryStr = url.substring(index+1);
	var params = queryStr.split('&');
	var param = {};
	for(var i=0; i<params.length; i++){
		var paramArray = params[i].split('=');
		if(paramArray.length == 2){
			if(param[paramArray[0]] == undefined){
				param[paramArray[0]] = paramArray[1];
			}else{
				var arr1;
				if(toString.call(param[paramArray[0]]) == "[object Array]"){//当之前己放入的是数组
					arr1 = param[paramArray[0]];
				}else{
					arr1 = [];
					param[paramArray[0]] = arr1;
				}
				arr1.push(paramArray[1]);
			}
		}else{
			if(param[paramArray[0]] == undefined){
				param[paramArray[0]] = "";
			}else{
				var arr1;
				if(toString.call(param[paramArray[0]]) == "[object Array]"){
					arr1 = param[paramArray[0]];
				}else{
					arr1 = [];
					param[paramArray[0]] = arr1;
				}
				arr1.push("");
			}
		}
	}
	return param;
}

/**
 * 正整数>0
 */
function isPInt(str) {
    var g = /^[1-9]*[1-9][0-9]*$/;
    return g.test(str);
}
/**
 * 正整数(含0)
 */
function isPInt1(str) {
	if(isPInt(str) || str == '0')
    	return true;
	return false;
}
/**
 * 大于0的正数(包含0，小数)
 */
function isPluses(str) {
//	var gtZero = true;
//	try{
//		console.info(parseFloat(str));
//	}catch (e) {
//		console.info(e);
//		gtZero = false;
//	}
//	console.info(gtZero);

	//var g = /^\d+(?=\.{0,1}\d+$|$)/;
    //return g.test(str);

	var parnt = /^[1-9]\d*(\.\d+)?$/;
	var parnt1 = /^[1-9]\d*(\.)?$/;

//	console.info(parnt.test(str));
//	console.info(parnt1.test(str));
	var isPlusesBoolean = parnt.test(str) || parnt1.test(str);
//	console.info(isPlusesBoolean);
	return isPlusesBoolean;

//	if(isEmpty(str)){
//		return false;
//	}
//	var regu = "^\\d+(\\.\\d+)?$";
//	var regExp = new RegExp(regu);
//	if(str.search(regExp) != -1 || isPInt1(str)){
//		return true;
//	}else{
//		return false;
//	}
}

function copyProperties(dest, src){
	for (var property in src) {
		//if(dest[property] == undefined){
		//	console.info(property);
		//}
		if(dest[property] == undefined){
			dest[property] = src[property];
		}else{
			var popertyType = toString.call(src[property]);
			if(popertyType == "[object Object]" && undefined == src[property].parentNode){//是對象類型,且不為dom
					copyProperties(dest[property], src[property]);
			}else if(popertyType == "[object Array]" && dest[property].length != 0){//當對象為數組類型,且目標節點length不為0
				for(var i=0; i < src[property].length; i++){
					var subPopertyType = toString.call(src[property][i]);
					if(subPopertyType == "[object Object]" || subPopertyType == "[object Array]"){//當為對象功數組類型時
						if(dest[property][i] == null){//當目標數組節點不存在
							dest[property][i] = src[property][i];
						}else{
							copyProperties(dest[property][i], src[property][i]);
						}
					}else{
						dest[property][i] = src[property][i];
					}
				}
			}else{
				dest[property] = src[property];
			}
		}
	}
}

function clone(obj){
	var newObj ;
	var type = toString.call(obj);
	if(type == "[object Object]"){
		newObj = {};
		copyProperties(newObj, obj)
	}else if(type == "[object Array]"){
		newObj = [];
		for(var i=0; i<obj.length; i++){
			newObj[i] = clone(obj[i]);
		}
	}else{
		newObj = obj;
	}
	return newObj;
}

var key = ['isAdd', 'isUpdate', 'isDelete', 'isDel', 'uuid', '$$hashKey', 'isShowEdit'];
function removeKey(data){
	if($.type(data) == 'array'){
		for(var i=0; i<data.length; i++){
			if($.type(data[i]) == 'object'){
				for(var j=0; j<key.length; j++){
					delete data[i][key[j]];
				}
			}else if($.type(data[i]) == 'array'){
				removeKey(data[i]);
			}
		}
	}else if($.type(data) == 'object'){
		for(var i=0; i<key.length; i++){
			delete data[key[i]];
		}
		for(var mapKey in data){
			if($.type(data[mapKey]) == 'object' || $.type(data[mapKey]) == 'array'){
				removeKey(data[mapKey]);
			}
		}
	}
}

Date.prototype.format = function(fmt){
	var o = {
			"M+" : this.getMonth()+1,                 //月份
			"d+" : this.getDate(),                    //日
			"h+" : this.getHours(),                   //小时
			"m+" : this.getMinutes(),                 //分
			"s+" : this.getSeconds(),                 //秒
			"q+" : Math.floor((this.getMonth()+3)/3), //季度
			"S"  : this.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("("+ k +")").test(fmt))
	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	return fmt;
};
