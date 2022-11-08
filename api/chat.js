const express = require('express');

const route = express.Router();
const request = require('request');
var xmldoc = require('xmldoc');

var mywxid = ""; //机器人wxid
var adminwxid = ""; //管理员wxid
var url ="http://127.0.0.1:7777/DaenWxHook/httpapi/?wxid="+mywxid;
var path = "DaenWxHook/httpapi/"
var api = "" //服务器地址

var backRate = 0.25; //佣金比例

route.post('/',(req,res)=>{ 
    req.on("data", function(data) {
        try {
            var params = JSON.parse(data.toString());
        } catch (error) {
            console.log(error);
            console.log(data);
            return;
        }

        switch (params.event) {
            case 10006: //转账事件
                if (params.data.data.money=="1.00" || params.data.data.money=="5.00" || params.data.data.money=="16.00" ||params.data.data.money=="20.00") {
                    if (params.data.data.msgSource=="1") {
                        receiveMoney({
                            "type":"Q0016",
                            "data":{
                                "wxid":params.data.data.fromWxid,
                                "transferid":params.data.data.transferid,
                            }
                        })
                        switch (params.data.data.money) {
                            case "1.00":
                                getKey({day_activation:1},params.data.data.fromWxid,params.data.data.money);
                                //inviteBack({wxid:params.data.data.fromWxid},{wxname:params.data.data.memo,paymoney:parseInt(params.data.data.money)})
                                break;
                            case "5.00":
                                getKey({day_activation:7},params.data.data.fromWxid,params.data.data.money)
                                //inviteBack({wxid:params.data.data.fromWxid},{wxname:params.data.data.memo,paymoney:parseInt(params.data.data.money)})
                                break;
                            case "16.00":
                                getKey({day_activation:30},params.data.data.fromWxid,params.data.data.money)
                                //inviteBack({wxid:params.data.data.fromWxid},{wxname:params.data.data.memo,paymoney:parseInt(params.data.data.money)})
                                break;
                            case "20.00":
                                getKey({day_activation:1500},params.data.data.fromWxid,params.data.data.money)
                                //inviteBack({wxid:params.data.data.fromWxid},{wxname:params.data.data.memo,paymoney:parseInt(params.data.data.money)})
                                break;
                            default:
                                break;
                        }
                        setUsercount({purchase_amount:parseInt(params.data.data.money),wxid:params.data.data.fromWxid})
                        
                    }
                    
                }else{
                    if (params.data.data.msgSource=="1" && params.data.data.transType=="1") {
                        sendMessage({
                            "type":"Q0001",
                            "data":{
                                "wxid":params.data.data.fromWxid,
                                "msg":"人工客服将在稍后处理此订单！"
                            }
                        })
                    }
                }
                break;
            case 10009: //自动回复
                if (params.data.data.msg=="1" && params.data.data.msgType=="1" && params.data.data.fromType=="1") {
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"转账秒发激活码\n天卡1.00元\r周卡5.00元\r月卡16.00元\r永久20.00元\n直接转账即可(请勿使用洪包)"
                        }
                    })
                } else if(params.data.data.msg=="2" && params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"完美校园APP下载地址\rhttp://download.iqsai.xyz/"
                        }
                    })
                } else if(params.data.data.msg=="3" && params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"注册流程：\r①下载APP\r②使用激活码注册（激活码需购买）\r③设置资料、照片、学校后,即可正常使用"
                        }
                    })
                } else if(params.data.data.msg=="4" && params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"收到！\r请发送账号，等待人工客服处理！"
                        }
                    })
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":adminwxid,
                            "msg":params.data.data.fromWxid+"忘记密码，请处理！"
                        }
                    })
                } else if(params.data.data.msg=="5" && params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"收到，请等待人工客服！"
                        }
                    })
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":adminwxid,
                            "msg":params.data.data.fromWxid+"有事咨询，请处理！"
                        }
                    })
                } else if(params.data.data.msg=="余额" && params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    getBalance({wxid:params.data.data.fromWxid})
                } else if(params.data.data.msgType=="10000" && params.data.data.fromType=="1" && params.data.data.msg=="Red packet received. View on phone."){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"暂不支持洪包购买，请使用转账功能。"
                        }
                    })
                }else if(params.data.data.fromType=="1" && params.data.data.msgType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"完美校园（回复下方序列号）\n1.价格查询&购买\r2.下载地址\r3.注册流程\r4.忘记密码\r5.人工客服\n若长时间不回复，使用by.aaaaabbbbbccccc.cn获取最新联系方式"
                        }
                    })
                }

                if(params.data.data.msgType==42 && params.data.data.fromType==1){ //收到名片
                    var document = new xmldoc.XmlDocument(params.data.data.msg.toString());
                    searchUserinfo({nickname:document.attr.nickname,invite_wxid:params.data.data.fromWxid});
                    
                }
                break;
            case 10011://加好友
                agreeFriend({
                    "type":"Q0017",
                    "data":{
                        "scene":params.data.data.scene,
                        "v3":params.data.data.v3,
                        "v4":params.data.data.v4
                    }
                })
                setUserinfo({wxid:params.data.data.wxid})
                break;
            default:
                break;
        }
        res.send({
            stateCode:200,
        })
    });
   
})


function sendMessage(senddata) { //发送消息
        var options = {
            url:url,
            path: path,
            method: 'POST',
            body:JSON.stringify(senddata)
        };
        request.post(options);
}

function receiveMoney(senddata) { //接收转账
    var options = {
        url:url,
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options)
}

function getKey(senddata,fromWxid,money) { //获取激活码
    var options = {
        url:api+"/getkey",
        path: "getkey",
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        var data =  JSON.parse(body) ;
        if (data.stateCode==200) {
            sendMessage({ //发送激活码
                "type":"Q0001",
                "data":{
                    "wxid":fromWxid,
                    "msg":"购买成功，有效期"+senddata.day_activation+"天！\r激活码："+data.message
                }
            })
            sendMessage({ //通知管理员交易消息
                "type":"Q0001",
                "data":{
                    "wxid":adminwxid,
                    "msg":fromWxid+"交易成功！\n金额："+money+"元"
                }
            })
        }
        
    })
}

function agreeFriend(senddata) { //通过好友申请
    var options = {
        url:url,
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options)
}

function inviteBack(senddata,userinfo) { //用户购买，邀请人结算
    var options = { //第一步，查询邀请人
        url:api+"/getWx_userinfo",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        if(JSON.parse(body).message[0].invite_wxid==undefined){
            console.log(body);
            return;
        }
        var data = JSON.parse(body);
        
        if(data.message[0].invite_wxid!="0"){
            sendMessage({ //第二步，发送消息通知邀请人
                "type":"Q0001",
                "data":{
                    "wxid":data.message[0].invite_wxid,
                    "msg":"您的朋友付款："+userinfo.paymoney+"元\r您获得奖励："+userinfo.paymoney*backRate+"元\r"
                }
            })
            var options = { //第三步，修改邀请人的余额
                url:api+"/setBalance",
                path: path,
                method: 'POST',
                body:JSON.stringify({
                    paymoney:userinfo.paymoney,
                    wxid:data.message[0].invite_wxid,
                    backRate:backRate
                })
            };
            request.post(options)
        }
        
    })
}

function setUserinfo(senddata) { //设置新用户信息
    var options = {
        url:api+"/setWx_userinfo",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options)
}

function getUserinfo(senddata) { //获取用户信息
    var options = {
        url:api+"/getWx_userinfo",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        var data = JSON.parse(body);
        console.log(data.message[0].invite_wxid);
    })
}

function getBalance(senddata) { //获取用户余额
    var options = {
        url:api+"/getWx_userinfo",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        var data = JSON.parse(body);
        sendMessage({ //通知用户余额
            "type":"Q0001",
            "data":{
                "wxid":data.message[0].wxid,
                "msg":data.message[0].wxid+" \r余额："+data.message[0].balance+"元"
            }
        })
    })
}

function setUsercount(senddata) { //累计购买金额
    var options = {
        url:api+"/setWx_usercount",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options)
}

function searchUserinfo(senddata) { //在好友列表搜索好友的信息,匹配用户名称并返回wxid
    var options = {
        url:url,
        path: path,
        method: 'POST',
        body:JSON.stringify({
            "type":"Q0005",
            "data":{
            "type":"1"
            }
        })
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        var data = JSON.parse(body).result;
        
        for (let index = 0; index < data.length; index++) {
            if (data[index].nick == senddata.nickname) {
                setInvite({wxid:data[index].wxid,invite_wxid:senddata.invite_wxid});
            }
            
        }
    })
}

function searchWxid(wxid) { //在好友列表搜索好友的信息,匹配用户名称并返回wxid
    var options = {
        url:url,
        path: path,
        method: 'POST',
        body:JSON.stringify({
            "type":"Q0005",
            "data":{
            "type":"1"
            }
        })
    };
    request.post(options, function (error, response, body) {
        if(error){
            console.log(error);
            return;
        }
        var data = JSON.parse(body).result;
        
        for (let index = 0; index < data.length; index++) {
            if (data[index].wxid == wxid) {
                console.log(data[index].nick);
                
            }
            
        }
    })
}

function setInvite(senddata) { //绑定邀请
    var options = {
        url:api+"/setInvite",
        path: path,
        method: 'POST',
        body:JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if(error){
            sendMessage({ //提示绑定成功
                "type":"Q0001",
                "data":{
                    "wxid":senddata.invite_wxid,
                    "msg":senddata.wxid+"绑定失败，请再次尝试！"
                }
            })
            return;
        }
        var data = JSON.parse(body);
        sendMessage({ //提示绑定成功
            "type":"Q0001",
            "data":{
                "wxid":senddata.invite_wxid,
                "msg":senddata.wxid+"绑定成功！"
            }
        })
        
    })

    
}

module.exports = route;