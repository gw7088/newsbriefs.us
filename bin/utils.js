'use strict'

module.exports = class Utils {
	simpleSuccess(msg,data){
		let response = {};
		if(typeof data!='undefined') response.data = data;
		response.success = true;
		response.message = msg;
		return response;
	}
	simpleFail(msg,data){
		let response = {};
		if(typeof data==='object') response.data = data;
		response.success = false;
		response.message = msg;
		return response;
	}
}