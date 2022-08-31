"use strict"
const { segment } = require("oicq")
const { bot } = require("./index")
const weather = require("./weather")
const data = require("./schedule")
// hello world
bot.on("message", function (msg) {
	if (msg.raw_message === "hello")
		msg.reply("hello world", true) //改为false则不会引用
})

// 天气
bot.on("message", function (msg) {
	if (msg.raw_message === "天气") {
		var a = weather.weather;
		var b = "";
		if (a.week == 1) b = "一";
		else if (a.week == 2) b = "二";
		else if (a.week == 3) b = "三";
		else if (a.week == 4) b = "四";
		else if (a.week == 5) b = "五";
		else if (a.week == 6) b = "六";
		else if (a.week == 7) b = "日";
		var data = "今天日期为" + a.date + "\n星期" + b + "\n白天" + a.dayweather + "，平均气温" + a.daytemp + "℃\n夜间" + a.nightweather + "，平均气温" + a.nighttemp + "℃";
		if (a.dayweather.search("雨")) data += "\n请注意带伞！！！";
		msg.reply(data, true) //改为false则不会引用
	}
})

bot.on("message", function (msg) {
	var d1 = new Date();
	var d2 = new Date("2022/08/29 00:00:00");
	var rq = d1 - d2;
	var s1 = Math.ceil(rq / (24 * 60 * 60 * 1000));
	var s2 = Math.ceil(s1 / 7);
	console.log('s1', s1)
	console.log('s2', s2)
	console.log('d1', d1)
	console.log('d2', d2)

	if (msg.raw_message === "课表") {
		var a = weather.weather.week;
		var word = "";
		if (s2 & 1) word += "当前为第"+s2+"周，单周，本学期第"+s1+"天\n";
		else word += "当前为第"+s2+"周，双周，本学期第"+s1+"天\n";
		console.log('word', word)
		if (a >= 1 && a <= 4) {
			word += data.schedule[a];
			if (a == 3 && !s2 & 1) {
				word += "\n第三~四节：大数据，YF3204"
			}
		}
		else word += "今天没课~"

		msg.reply(word, true) //改为false则不会引用
	}
})

// 撤回和发送群消息
bot.on("message.group", function (msg) {
	if (msg.raw_message === "dice") {
		// 撤回这条消息
		msg.recall()
		// 发送一个骰子
		msg.group.sendMsg(segment.dice())
		// 发送一个戳一戳
		msg.member.poke()
	}
})

// 接收戳一戳
bot.on("notice.group.poke", function (e) {
	if (e.target_id === this.uin)
		e.group.sendMsg("dont poke me")
})
