const express = require('express');

const route = express.Router();
const request = require('request');
var xmldoc = require('xmldoc');

var mywxid = ""; //机器人wxid
var adminwxid = ""; //管理员wxid
var url ="http://127.0.0.1:7777/DaenWxHook/httpapi/?wxid="+mywxid;
var path = "DaenWxHook/httpapi/"

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
                if (params.data.data.msgSource=="1") {
                        receiveMoney({
                            "type":"Q0016",
                            "data":{
                                "wxid":params.data.data.fromWxid,
                                "transferid":params.data.data.transferid,
                            }
                        })
                    }
                break;
            case 10009: //自动回复
                if(params.data.data.msgType=="1" && params.data.data.fromType=="1"){
                    sendMessage({
                        "type":"Q0001",
                        "data":{
                            "wxid":params.data.data.fromWxid,
                            "msg":"你好\n我是你的微信机器人\r我叫唠个锤子"
                        }
                    })
                }
                break;
            case 10011://加好友秒通过
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

function agreeFriend(senddata) { //通过好友申请
    var options = {
        url:url,
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



module.exports = route;