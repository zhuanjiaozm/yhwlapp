/*
 * @Author: 疯子乔
 * @Date:   2016-11-14 15:10:43
 * @Last Modified by:  疯子乔
 * @Last Modified time: 2016-11-16 17:53:40
 */

var app = angular.module('app', ['ui.bootstrap']);
app.controller('addCustomerCtrl', ['$scope', '$http', function($scope, $http) {
    //下拉选项
    //企业性质
    var deleteAddressObj = {};
    $scope.natureList = [{
        id: 10501,
        name: '国有企业'
    }, {
        id: 10502,
        name: '私营企业'
    }, {
        id: 10503,
        name: '外商独资'
    }, {
        id: 10504,
        name: '中外合资'
    }, {
        id: 10505,
        name: '其他'
    }, {
        id: 10506,
        name: '名营企业'
    }];
    //是否开发票
    $scope.isInvoiceList = [{
        id: 0,
        name: '否'
    }, {
        id: 1,
        name: '是'
    }];
    //地址类型是装货还是卸货
    $scope.isLoadList = [{
        id: 0,
        name: '装货'
    }, {
        id: 1,
        name: '卸货'
    }];
    //默认新增装卸货地址的按钮是显示的
    $scope.addEable = true;

    //jquery从URL中获取参数
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if(r !== null) return unescape(r[2]);
        return null; //返回参数值
    }

    //弹出用户操作结果
    function alertOperateResult(msg) {
        if(msg) {
            $("#save-result").find(".modal-body").html(msg);
            $('#save-result').modal();
        } else {
            console.log('alertOperateResult方法没有传入需要弹出的信息（即mgs参数）');
        }
    }

    if(getUrlParam('id')) {
        //获取当前用户信息
        $http.get("corporation/find.do?id=" + getUrlParam('id'))
            .success(function(response) {
                $scope.newCustomer = response.data.content[0];
                // console.info("ID：",getUrlParam('id'),'的用的是：');
                // console.info($scope.newCustomer);
            });
        //获取当前用户的所有装卸货地址
        $http.get("corporation/findCorpAddr.do?corporationId=" + getUrlParam('id'))
            .success(function(response) {
                $scope.addressList = response.data;
            });
    } else {
        //当用户id不存在时则认为是新增用户，设置其装卸货地均为空
        $scope.newCustomer = {};
        $scope.addressList = [];
    }

    $scope.launchPopover = function(address){
        deleteAddressObj = address;
    };
    $scope.deleteAddr = function() {
        if(!deleteAddressObj.id) {
            $scope.addressList.shift();
            alertOperateResult('您已成功删除当前未保存的装卸货地址！');
            //console.info('当前装卸货地址：',$scope.addressList);
            $scope.addEable = true;
        } else {
            $http.get("corporation/deleteCorpAddr.do?id=" + deleteAddressObj.id)
                .success(function(response) {
                    $scope.addressList = response.data;
                }).then(function successCallback(response) {
                    console.log(response.data.errorcode);
                    if(1 == response.data.errorcode) {
                        alertOperateResult('恭喜您,删除装卸货地址成功！');
                        $http.get("corporation/findCorpAddr.do?corporationId=" + getUrlParam('id'))
                            .success(function(response) {
                                $scope.addressList = response.data;
                                $scope.addEable = true;
                            });
                    } else {
                        alertOperateResult('很遗憾，删除装卸货地址失败！');
                        console.error("删除客户装卸货地址发生系统错误:", response);
                    }
                }, function errorCallback(response) {
                    alertOperateResult('很遗憾，删除装卸货地址失败！');
                    console.error("删除客户装卸货地址发生网络错误:", response);
                });
        }
    };

    //新增装卸货地址，即向地址列表数组中新增一个空对象
    $scope.addNewAddress = function() {
        if(!$scope.addressList) {
            $scope.addressList = [];
        }
        $scope.addressList.unshift({
            contactPerson: '',
            contactCell: '',
            isLoad: 0,
            addr: '',
            remark: ''
        });
        //隐藏新增地址的按钮
        $scope.addEable = false;
        console.log("新增后的地址数组：", $scope.addressList);
    };

    $scope.saveNewAddress = function(address) {
        var saveAddressObj = address;

        if(!saveAddressObj.id) {
            delete saveAddressObj.id;
        }

        if(!getUrlParam('id')) {
            return false;
        } else {
            saveAddressObj.corporationId = getUrlParam('id');
        }

        if(!saveAddressObj.contactPerson) {
            alertOperateResult('请填写联系人后重试！');
            return false;
        }
        if(!saveAddressObj.isLoad) {
            alertOperateResult('请选择地址类型(装/卸货)后重试！');
            return false;
        }
        if(!saveAddressObj.contactCell) {
            alertOperateResult('请填写联系人手机号码后重试！');
            return false;
        }
        if(!saveAddressObj.addr) {
            alertOperateResult('请填写地址信息后重试！');
            return false;
        }

        $http({
            method: 'POST',
            url: 'corporation/saveCorpAddr.do',
            data: saveAddressObj
        }).then(function successCallback(response) {
            console.info(response.data.errorcode);
            if(1 == response.data.errorcode) {
                alertOperateResult('恭喜您,保存装卸货地址成功！');
                //获取当前用户的所有装卸货地址
                $http.get("corporation/findCorpAddr.do?corporationId=" + getUrlParam('id'))
                    .success(function(response) {
                        $scope.addressList = response.data;
                    });
            } else {
                alertOperateResult('很遗憾，保存装卸货地址失败！');
                console.error("保存用户信息发生系统错误:", response);
            }
        }, function errorCallback(response) {
            alertOperateResult('很遗憾，保存装卸货地址失败！');
            console.error("保存用户信息发生网络错误:", response);
        });
    };

    //保存新增用户信息
    //对象属性列表
    var saveRequiredAttr = ['name', 'nameEn', 'swiftcode', 'addr', 'nature', 'url', 'isInvoice'];
    $scope.save = function(newCustomer) {
        for(var i = 0; i < saveRequiredAttr.length; i++) {
            var temp = newCustomer[i];
            console.log("newCustomer[temp]:", newCustomer[temp]);
            if(newCustomer[temp] === null) {
                return false;
            }
        }
        $http({
            method: 'POST',
            url: 'corporation/save.do',
            data: {
                name: newCustomer.name,
                nameEn: newCustomer.nameEn,
                swiftcode: newCustomer.swiftcode,
                addr: newCustomer.addr,
                nature: newCustomer.nature,
                url: newCustomer.url,
                isInvoice: newCustomer.isInvoice
            }
        }).then(function successCallback(response) {
            if(response.errorcode == 1) {
                //成功
                alertOperateResult('恭喜您,保存客户信息成功！');
            } else {
                alertOperateResult('很遗憾，保存客户信息失败！');
                console.error("保存用户信息发生系统错误:", response);
            }
        }, function errorCallback(response) {
            alertOperateResult('很遗憾，保存用户信息失败！');
            console.error("保存客户信息发生网络错误:", response);
        });
    };
}]);
