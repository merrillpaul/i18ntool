!function(window,angular){function jsonStringToDate(string){var match,R_ISO8061_STR=/^(-?\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;if(match=string.match(R_ISO8061_STR)){var date=new Date(0),tzHour=0,tzMin=0;return match[9]&&(tzHour=toInt(match[9]+match[10]),tzMin=toInt(match[9]+match[11])),date.setUTCFullYear(toInt(match[1]),toInt(match[2])-1,toInt(match[3])),date.setUTCHours(toInt(match[4]||0)-tzHour,toInt(match[5]||0)-tzMin,toInt(match[6]||0),toInt(match[7]||0)),date}return string}function toInt(str){return parseInt(str,10)}function padNumberInMock(num,digits,trim){var neg="";for(0>num&&(neg="-",num=-num),num=""+num;num.length<digits;)num="0"+num;return trim&&(num=num.substr(num.length-digits)),neg+num}function createHttpBackendMock($rootScope,$timeout,$delegate,$browser){function createResponse(status,data,headers,statusText){return angular.isFunction(status)?status:function(){return angular.isNumber(status)?[status,data,headers,statusText]:[200,status,data,headers]}}function $httpBackend(method,url,data,callback,headers,timeout,withCredentials,responseType,eventHandlers,uploadEventHandlers){function prettyPrint(data){return angular.isString(data)||angular.isFunction(data)||data instanceof RegExp?data:angular.toJson(data)}function wrapResponse(wrapped){function handleResponse(){var response=wrapped.response(method,url,data,headers,wrapped.params(url));xhr.$$respHeaders=response[2],callback(copy(response[0]),copy(response[1]),xhr.getAllResponseHeaders(),copy(response[3]||""))}function handleTimeout(){for(var i=0,ii=responses.length;ii>i;i++)if(responses[i]===handleResponse){responses.splice(i,1),callback(-1,void 0,"");break}}return!$browser&&timeout&&(timeout.then?timeout.then(handleTimeout):$timeout(handleTimeout,timeout)),handleResponse}var xhr=new MockXhr,expectation=expectations[0],wasExpected=!1;if(xhr.$$events=eventHandlers,xhr.upload.$$events=uploadEventHandlers,expectation&&expectation.match(method,url)){if(!expectation.matchData(data))throw new Error("Expected "+expectation+" with different data\nEXPECTED: "+prettyPrint(expectation.data)+"\nGOT:      "+data);if(!expectation.matchHeaders(headers))throw new Error("Expected "+expectation+" with different headers\nEXPECTED: "+prettyPrint(expectation.headers)+"\nGOT:      "+prettyPrint(headers));if(expectations.shift(),expectation.response)return void responses.push(wrapResponse(expectation));wasExpected=!0}for(var definition,i=-1;definition=definitions[++i];)if(definition.match(method,url,data,headers||{})){if(definition.response)($browser?$browser.defer:responsesPush)(wrapResponse(definition));else{if(!definition.passThrough)throw new Error("No response defined !");originalHttpBackend(method,url,data,callback,headers,timeout,withCredentials,responseType,eventHandlers,uploadEventHandlers)}return}throw wasExpected?new Error("No response defined !"):new Error("Unexpected request: "+method+" "+url+"\n"+(expectation?"Expected "+expectation:"No more request expected"))}function parseRoute(url){var ret={regexp:url},keys=ret.keys=[];return url&&angular.isString(url)?(url=url.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)([?*])?/g,function(_,slash,key,option){var optional="?"===option?option:null,star="*"===option?option:null;return keys.push({name:key,optional:!!optional}),slash=slash||"",""+(optional?"":slash)+"(?:"+(optional?slash:"")+(star&&"(.+?)"||"([^/]+)")+(optional||"")+")"+(optional||"")}).replace(/([\/$*])/g,"\\$1"),ret.regexp=new RegExp("^"+url,"i"),ret):ret}function createShortMethods(prefix){angular.forEach(["GET","DELETE","JSONP","HEAD"],function(method){$httpBackend[prefix+method]=function(url,headers,keys){return assertArgDefined(arguments,0,"url"),angular.isUndefined(url)&&(url=null),$httpBackend[prefix](method,url,void 0,headers,keys)}}),angular.forEach(["PUT","POST","PATCH"],function(method){$httpBackend[prefix+method]=function(url,data,headers,keys){return assertArgDefined(arguments,0,"url"),angular.isUndefined(url)&&(url=null),$httpBackend[prefix](method,url,data,headers,keys)}})}var definitions=[],expectations=[],responses=[],responsesPush=angular.bind(responses,responses.push),copy=angular.copy,originalHttpBackend=$delegate.$$originalHttpBackend||$delegate;return $httpBackend.when=function(method,url,data,headers,keys){assertArgDefined(arguments,1,"url");var definition=new MockHttpExpectation(method,url,data,headers,keys),chain={respond:function(status,data,headers,statusText){return definition.passThrough=void 0,definition.response=createResponse(status,data,headers,statusText),chain}};return $browser&&(chain.passThrough=function(){return definition.response=void 0,definition.passThrough=!0,chain}),definitions.push(definition),chain},createShortMethods("when"),$httpBackend.whenRoute=function(method,url){var pathObj=parseRoute(url);return $httpBackend.when(method,pathObj.regexp,void 0,void 0,pathObj.keys)},$httpBackend.expect=function(method,url,data,headers,keys){assertArgDefined(arguments,1,"url");var expectation=new MockHttpExpectation(method,url,data,headers,keys),chain={respond:function(status,data,headers,statusText){return expectation.response=createResponse(status,data,headers,statusText),chain}};return expectations.push(expectation),chain},createShortMethods("expect"),$httpBackend.expectRoute=function(method,url){var pathObj=parseRoute(url);return $httpBackend.expect(method,pathObj.regexp,void 0,void 0,pathObj.keys)},$httpBackend.flush=function(count,skip,digest){if(digest!==!1&&$rootScope.$digest(),skip=skip||0,skip>=responses.length)throw new Error("No pending request to flush !");if(angular.isDefined(count)&&null!==count)for(;count--;){var part=responses.splice(skip,1);if(!part.length)throw new Error("No more pending request to flush !");part[0]()}else for(;responses.length>skip;)responses.splice(skip,1)[0]();$httpBackend.verifyNoOutstandingExpectation(digest)},$httpBackend.verifyNoOutstandingExpectation=function(digest){if(digest!==!1&&$rootScope.$digest(),expectations.length)throw new Error("Unsatisfied requests: "+expectations.join(", "))},$httpBackend.verifyNoOutstandingRequest=function(digest){if(digest!==!1&&$rootScope.$digest(),responses.length)throw new Error("Unflushed requests: "+responses.length)},$httpBackend.resetExpectations=function(){expectations.length=0,responses.length=0},$httpBackend.$$originalHttpBackend=originalHttpBackend,$httpBackend}function assertArgDefined(args,index,name){if(args.length>index&&angular.isUndefined(args[index]))throw new Error("Undefined argument `"+name+"`; the argument is provided but not defined")}function MockHttpExpectation(method,url,data,headers,keys){function getUrlParams(u){var params=u.slice(u.indexOf("?")+1).split("&");return params.sort()}function compareUrl(u){return url.slice(0,url.indexOf("?"))===u.slice(0,u.indexOf("?"))&&getUrlParams(url).join()===getUrlParams(u).join()}this.data=data,this.headers=headers,this.match=function(m,u,d,h){return method!==m?!1:this.matchUrl(u)?angular.isDefined(d)&&!this.matchData(d)?!1:angular.isDefined(h)&&!this.matchHeaders(h)?!1:!0:!1},this.matchUrl=function(u){return url?angular.isFunction(url.test)?url.test(u):angular.isFunction(url)?url(u):url===u||compareUrl(u):!0},this.matchHeaders=function(h){return angular.isUndefined(headers)?!0:angular.isFunction(headers)?headers(h):angular.equals(headers,h)},this.matchData=function(d){return angular.isUndefined(data)?!0:data&&angular.isFunction(data.test)?data.test(d):data&&angular.isFunction(data)?data(d):data&&!angular.isString(data)?angular.equals(angular.fromJson(angular.toJson(data)),angular.fromJson(d)):data==d},this.toString=function(){return method+" "+url},this.params=function(u){function pathParams(){var keyObj={};if(!url||!angular.isFunction(url.test)||!keys||0===keys.length)return keyObj;var m=url.exec(u);if(!m)return keyObj;for(var i=1,len=m.length;len>i;++i){var key=keys[i-1],val=m[i];key&&val&&(keyObj[key.name||key]=val)}return keyObj}function parseQuery(){var key_value,key,obj={},queryStr=u.indexOf("?")>-1?u.substring(u.indexOf("?")+1):"";return angular.forEach(queryStr.split("&"),function(keyValue){if(keyValue&&(key_value=keyValue.replace(/\+/g,"%20").split("="),key=tryDecodeURIComponent(key_value[0]),angular.isDefined(key))){var val=angular.isDefined(key_value[1])?tryDecodeURIComponent(key_value[1]):!0;hasOwnProperty.call(obj,key)?angular.isArray(obj[key])?obj[key].push(val):obj[key]=[obj[key],val]:obj[key]=val}}),obj}function tryDecodeURIComponent(value){try{return decodeURIComponent(value)}catch(e){}}return angular.extend(parseQuery(),pathParams())}}function MockXhr(){MockXhr.$$lastInstance=this,this.open=function(method,url,async){this.$$method=method,this.$$url=url,this.$$async=async,this.$$reqHeaders={},this.$$respHeaders={}},this.send=function(data){this.$$data=data},this.setRequestHeader=function(key,value){this.$$reqHeaders[key]=value},this.getResponseHeader=function(name){var header=this.$$respHeaders[name];return header?header:(name=angular.lowercase(name),(header=this.$$respHeaders[name])?header:(header=void 0,angular.forEach(this.$$respHeaders,function(headerVal,headerName){header||angular.lowercase(headerName)!==name||(header=headerVal)}),header))},this.getAllResponseHeaders=function(){var lines=[];return angular.forEach(this.$$respHeaders,function(value,key){lines.push(key+": "+value)}),lines.join("\n")},this.abort=angular.noop,this.$$events={},this.addEventListener=function(name,listener){angular.isUndefined(this.$$events[name])&&(this.$$events[name]=[]),this.$$events[name].push(listener)},this.upload={$$events:{},addEventListener:this.addEventListener}}function createControllerDecorator(compileProvider){return angular.mock.$ControllerDecorator=["$delegate",function($delegate){return function(expression,locals,later,ident){if(later&&"object"==typeof later){var preAssignBindingsEnabled=compileProvider.preAssignBindingsEnabled(),instantiate=$delegate(expression,locals,!0,ident);preAssignBindingsEnabled&&angular.extend(instantiate.instance,later);var instance=instantiate();return preAssignBindingsEnabled&&instance===instantiate.instance||angular.extend(instance,later),instance}return $delegate(expression,locals,later,ident)}}],angular.mock.$ControllerDecorator}angular.mock={},angular.mock.$BrowserProvider=function(){this.$get=function(){return new angular.mock.$Browser}},angular.mock.$Browser=function(){var self=this;this.isMock=!0,self.$$url="http://server/",self.$$lastUrl=self.$$url,self.pollFns=[];var outstandingRequestCount=0,outstandingRequestCallbacks=[];self.$$incOutstandingRequestCount=function(){outstandingRequestCount++},self.$$completeOutstandingRequest=function(fn){try{fn()}finally{if(outstandingRequestCount--,!outstandingRequestCount)for(;outstandingRequestCallbacks.length;)outstandingRequestCallbacks.pop()()}},self.notifyWhenNoOutstandingRequests=function(callback){outstandingRequestCount?outstandingRequestCallbacks.push(callback):callback()},self.onUrlChange=function(listener){return self.pollFns.push(function(){(self.$$lastUrl!==self.$$url||self.$$state!==self.$$lastState)&&(self.$$lastUrl=self.$$url,self.$$lastState=self.$$state,listener(self.$$url,self.$$state))}),listener},self.$$applicationDestroyed=angular.noop,self.$$checkUrlChange=angular.noop,self.deferredFns=[],self.deferredNextId=0,self.defer=function(fn,delay){return delay=delay||0,self.deferredFns.push({time:self.defer.now+delay,fn:fn,id:self.deferredNextId}),self.deferredFns.sort(function(a,b){return a.time-b.time}),self.deferredNextId++},self.defer.now=0,self.defer.cancel=function(deferId){var fnIndex;return angular.forEach(self.deferredFns,function(fn,index){fn.id===deferId&&(fnIndex=index)}),angular.isDefined(fnIndex)?(self.deferredFns.splice(fnIndex,1),!0):!1},self.defer.flush=function(delay){var nextTime;if(angular.isDefined(delay))nextTime=self.defer.now+delay;else{if(!self.deferredFns.length)throw new Error("No deferred tasks to be flushed");nextTime=self.deferredFns[self.deferredFns.length-1].time}for(;self.deferredFns.length&&self.deferredFns[0].time<=nextTime;)self.defer.now=self.deferredFns[0].time,self.deferredFns.shift().fn();self.defer.now=nextTime},self.$$baseHref="/",self.baseHref=function(){return this.$$baseHref}},angular.mock.$Browser.prototype={poll:function(){angular.forEach(this.pollFns,function(pollFn){pollFn()})},url:function(url,replace,state){return angular.isUndefined(state)&&(state=null),url?(this.$$url=url,this.$$state=angular.copy(state),this):this.$$url},state:function(){return this.$$state}},angular.mock.$ExceptionHandlerProvider=function(){var handler;this.mode=function(mode){switch(mode){case"log":case"rethrow":var errors=[];handler=function(e){if(1===arguments.length?errors.push(e):errors.push([].slice.call(arguments,0)),"rethrow"===mode)throw e},handler.errors=errors;break;default:throw new Error("Unknown mode '"+mode+"', only 'log'/'rethrow' modes are allowed!")}},this.$get=function(){return handler},this.mode("rethrow")},angular.mock.$LogProvider=function(){function concat(array1,array2,index){return array1.concat(Array.prototype.slice.call(array2,index))}var debug=!0;this.debugEnabled=function(flag){return angular.isDefined(flag)?(debug=flag,this):debug},this.$get=function(){var $log={log:function(){$log.log.logs.push(concat([],arguments,0))},warn:function(){$log.warn.logs.push(concat([],arguments,0))},info:function(){$log.info.logs.push(concat([],arguments,0))},error:function(){$log.error.logs.push(concat([],arguments,0))},debug:function(){debug&&$log.debug.logs.push(concat([],arguments,0))}};return $log.reset=function(){$log.log.logs=[],$log.info.logs=[],$log.warn.logs=[],$log.error.logs=[],$log.debug.logs=[]},$log.assertEmpty=function(){var errors=[];if(angular.forEach(["error","warn","info","log","debug"],function(logLevel){angular.forEach($log[logLevel].logs,function(log){angular.forEach(log,function(logItem){errors.push("MOCK $log ("+logLevel+"): "+String(logItem)+"\n"+(logItem.stack||""))})})}),errors.length)throw errors.unshift("Expected $log to be empty! Either a message was logged unexpectedly, or an expected log message was not checked and removed:"),errors.push(""),new Error(errors.join("\n---------\n"))},$log.reset(),$log}},angular.mock.$IntervalProvider=function(){this.$get=["$browser","$rootScope","$q","$$q",function($browser,$rootScope,$q,$$q){var repeatFns=[],nextRepeatId=0,now=0,$interval=function(fn,delay,count,invokeApply){function tick(){if(deferred.notify(iteration++),count>0&&iteration>=count){var fnIndex;deferred.resolve(iteration),angular.forEach(repeatFns,function(fn,index){fn.id===promise.$$intervalId&&(fnIndex=index)}),angular.isDefined(fnIndex)&&repeatFns.splice(fnIndex,1)}skipApply?$browser.defer.flush():$rootScope.$apply()}var hasParams=arguments.length>4,args=hasParams?Array.prototype.slice.call(arguments,4):[],iteration=0,skipApply=angular.isDefined(invokeApply)&&!invokeApply,deferred=(skipApply?$$q:$q).defer(),promise=deferred.promise;return count=angular.isDefined(count)?count:0,promise.then(null,function(){},hasParams?function(){fn.apply(null,args)}:fn),promise.$$intervalId=nextRepeatId,repeatFns.push({nextTime:now+delay,delay:delay,fn:tick,id:nextRepeatId,deferred:deferred}),repeatFns.sort(function(a,b){return a.nextTime-b.nextTime}),nextRepeatId++,promise};return $interval.cancel=function(promise){if(!promise)return!1;var fnIndex;return angular.forEach(repeatFns,function(fn,index){fn.id===promise.$$intervalId&&(fnIndex=index)}),angular.isDefined(fnIndex)?(repeatFns[fnIndex].deferred.promise.then(void 0,function(){}),repeatFns[fnIndex].deferred.reject("canceled"),repeatFns.splice(fnIndex,1),!0):!1},$interval.flush=function(millis){for(now+=millis;repeatFns.length&&repeatFns[0].nextTime<=now;){var task=repeatFns[0];task.fn(),task.nextTime+=task.delay,repeatFns.sort(function(a,b){return a.nextTime-b.nextTime})}return millis},$interval}]},angular.mock.TzDate=function(offset,timestamp){var self=new Date(0);if(angular.isString(timestamp)){var tsStr=timestamp;if(self.origDate=jsonStringToDate(timestamp),timestamp=self.origDate.getTime(),isNaN(timestamp))throw{name:"Illegal Argument",message:"Arg '"+tsStr+"' passed into TzDate constructor is not a valid date string"}}else self.origDate=new Date(timestamp);var localOffset=new Date(timestamp).getTimezoneOffset();self.offsetDiff=60*localOffset*1e3-1e3*offset*60*60,self.date=new Date(timestamp+self.offsetDiff),self.getTime=function(){return self.date.getTime()-self.offsetDiff},self.toLocaleDateString=function(){return self.date.toLocaleDateString()},self.getFullYear=function(){return self.date.getFullYear()},self.getMonth=function(){return self.date.getMonth()},self.getDate=function(){return self.date.getDate()},self.getHours=function(){return self.date.getHours()},self.getMinutes=function(){return self.date.getMinutes()},self.getSeconds=function(){return self.date.getSeconds()},self.getMilliseconds=function(){return self.date.getMilliseconds()},self.getTimezoneOffset=function(){return 60*offset},self.getUTCFullYear=function(){return self.origDate.getUTCFullYear()},self.getUTCMonth=function(){return self.origDate.getUTCMonth()},self.getUTCDate=function(){return self.origDate.getUTCDate()},self.getUTCHours=function(){return self.origDate.getUTCHours()},self.getUTCMinutes=function(){return self.origDate.getUTCMinutes()},self.getUTCSeconds=function(){return self.origDate.getUTCSeconds()},self.getUTCMilliseconds=function(){return self.origDate.getUTCMilliseconds()},self.getDay=function(){return self.date.getDay()},self.toISOString&&(self.toISOString=function(){return padNumberInMock(self.origDate.getUTCFullYear(),4)+"-"+padNumberInMock(self.origDate.getUTCMonth()+1,2)+"-"+padNumberInMock(self.origDate.getUTCDate(),2)+"T"+padNumberInMock(self.origDate.getUTCHours(),2)+":"+padNumberInMock(self.origDate.getUTCMinutes(),2)+":"+padNumberInMock(self.origDate.getUTCSeconds(),2)+"."+padNumberInMock(self.origDate.getUTCMilliseconds(),3)+"Z"});var unimplementedMethods=["getUTCDay","getYear","setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds","setYear","toDateString","toGMTString","toJSON","toLocaleFormat","toLocaleString","toLocaleTimeString","toSource","toString","toTimeString","toUTCString","valueOf"];return angular.forEach(unimplementedMethods,function(methodName){self[methodName]=function(){throw new Error("Method '"+methodName+"' is not implemented in the TzDate mock")}}),self},angular.mock.TzDate.prototype=Date.prototype,angular.mock.animate=angular.module("ngAnimateMock",["ng"]).info({angularVersion:"1.6.4"}).config(["$provide",function($provide){$provide.factory("$$forceReflow",function(){function reflowFn(){reflowFn.totalReflows++}return reflowFn.totalReflows=0,reflowFn}),$provide.factory("$$animateAsyncRun",function(){var queue=[],queueFn=function(){return function(fn){queue.push(fn)}};return queueFn.flush=function(){if(0===queue.length)return!1;for(var i=0;i<queue.length;i++)queue[i]();return queue=[],!0},queueFn}),$provide.decorator("$$animateJs",["$delegate",function($delegate){var runners=[],animateJsConstructor=function(){var animator=$delegate.apply($delegate,arguments);return animator&&runners.push(animator),animator};return animateJsConstructor.$closeAndFlush=function(){runners.forEach(function(runner){runner.end()}),runners=[]},animateJsConstructor}]),$provide.decorator("$animateCss",["$delegate",function($delegate){var runners=[],animateCssConstructor=function(element,options){var animator=$delegate(element,options);return runners.push(animator),animator};return animateCssConstructor.$closeAndFlush=function(){runners.forEach(function(runner){runner.end()}),runners=[]},animateCssConstructor}]),$provide.decorator("$animate",["$delegate","$timeout","$browser","$$rAF","$animateCss","$$animateJs","$$forceReflow","$$animateAsyncRun","$rootScope",function($delegate,$timeout,$browser,$$rAF,$animateCss,$$animateJs,$$forceReflow,$$animateAsyncRun,$rootScope){var animate={queue:[],cancel:$delegate.cancel,on:$delegate.on,off:$delegate.off,pin:$delegate.pin,get reflows(){return $$forceReflow.totalReflows},enabled:$delegate.enabled,closeAndFlush:function(){this.flush(!0),$animateCss.$closeAndFlush(),$$animateJs.$closeAndFlush(),this.flush()},flush:function(hideErrors){$rootScope.$digest();var doNextRun,somethingFlushed=!1;do doNextRun=!1,$$rAF.queue.length&&($$rAF.flush(),doNextRun=somethingFlushed=!0),$$animateAsyncRun.flush()&&(doNextRun=somethingFlushed=!0);while(doNextRun);if(!somethingFlushed&&!hideErrors)throw new Error("No pending animations ready to be closed or flushed");$rootScope.$digest()}};return angular.forEach(["animate","enter","leave","move","addClass","removeClass","setClass"],function(method){animate[method]=function(){return animate.queue.push({event:method,element:arguments[0],options:arguments[arguments.length-1],args:arguments}),$delegate[method].apply($delegate,arguments)}}),animate}])}]),angular.mock.dump=function(object){function serialize(object){var out;return angular.isElement(object)?(object=angular.element(object),out=angular.element("<div></div>"),angular.forEach(object,function(element){out.append(angular.element(element).clone())}),out=out.html()):angular.isArray(object)?(out=[],angular.forEach(object,function(o){out.push(serialize(o))}),out="[ "+out.join(", ")+" ]"):out=angular.isObject(object)?angular.isFunction(object.$eval)&&angular.isFunction(object.$apply)?serializeScope(object):object instanceof Error?object.stack||""+object.name+": "+object.message:angular.toJson(object,!0):String(object),out}function serializeScope(scope,offset){offset=offset||"  ";var log=[offset+"Scope("+scope.$id+"): {"];for(var key in scope)Object.prototype.hasOwnProperty.call(scope,key)&&!key.match(/^(\$|this)/)&&log.push("  "+key+": "+angular.toJson(scope[key]));for(var child=scope.$$childHead;child;)log.push(serializeScope(child,offset+"  ")),child=child.$$nextSibling;return log.push("}"),log.join("\n"+offset)}return serialize(object)},angular.mock.$httpBackendDecorator=["$rootScope","$timeout","$delegate",createHttpBackendMock],angular.mock.$TimeoutDecorator=["$delegate","$browser",function($delegate,$browser){function formatPendingTasksAsString(tasks){var result=[];return angular.forEach(tasks,function(task){result.push("{id: "+task.id+", time: "+task.time+"}")}),result.join(", ")}return $delegate.flush=function(delay){$browser.defer.flush(delay)},$delegate.verifyNoPendingTasks=function(){if($browser.deferredFns.length)throw new Error("Deferred tasks to flush ("+$browser.deferredFns.length+"): "+formatPendingTasksAsString($browser.deferredFns))},$delegate}],angular.mock.$RAFDecorator=["$delegate",function($delegate){var rafFn=function(fn){var index=rafFn.queue.length;return rafFn.queue.push(fn),function(){rafFn.queue.splice(index,1)}};return rafFn.queue=[],rafFn.supported=$delegate.supported,rafFn.flush=function(){if(0===rafFn.queue.length)throw new Error("No rAF callbacks present");for(var length=rafFn.queue.length,i=0;length>i;i++)rafFn.queue[i]();rafFn.queue=rafFn.queue.slice(i)},rafFn}];var originalRootElement;angular.mock.$RootElementProvider=function(){this.$get=["$injector",function($injector){return originalRootElement=angular.element("<div ng-app></div>").data("$injector",$injector)}]},angular.mock.$ComponentControllerProvider=["$compileProvider",function($compileProvider){this.$get=["$controller","$injector","$rootScope",function($controller,$injector,$rootScope){return function(componentName,locals,bindings,ident){var directives=$injector.get(componentName+"Directive"),candidateDirectives=directives.filter(function(directiveInfo){return directiveInfo.controller&&directiveInfo.controllerAs&&"E"===directiveInfo.restrict});if(0===candidateDirectives.length)throw new Error("No component found");if(candidateDirectives.length>1)throw new Error("Too many components found");var directiveInfo=candidateDirectives[0];return locals=locals||{},locals.$scope=locals.$scope||$rootScope.$new(!0),$controller(directiveInfo.controller,locals,bindings,ident||directiveInfo.controllerAs)}}]}],angular.module("ngMock",["ng"]).provider({$browser:angular.mock.$BrowserProvider,$exceptionHandler:angular.mock.$ExceptionHandlerProvider,$log:angular.mock.$LogProvider,$interval:angular.mock.$IntervalProvider,$rootElement:angular.mock.$RootElementProvider,$componentController:angular.mock.$ComponentControllerProvider}).config(["$provide","$compileProvider",function($provide,$compileProvider){$provide.decorator("$timeout",angular.mock.$TimeoutDecorator),$provide.decorator("$$rAF",angular.mock.$RAFDecorator),$provide.decorator("$rootScope",angular.mock.$RootScopeDecorator),$provide.decorator("$controller",createControllerDecorator($compileProvider)),$provide.decorator("$httpBackend",angular.mock.$httpBackendDecorator)}]).info({angularVersion:"1.6.4"}),angular.module("ngMockE2E",["ng"]).config(["$provide",function($provide){$provide.decorator("$httpBackend",angular.mock.e2e.$httpBackendDecorator)}]).info({angularVersion:"1.6.4"}),angular.mock.e2e={},angular.mock.e2e.$httpBackendDecorator=["$rootScope","$timeout","$delegate","$browser",createHttpBackendMock],angular.mock.$RootScopeDecorator=["$delegate",function($delegate){function countChildScopes(){for(var currentScope,count=0,pendingChildHeads=[this.$$childHead];pendingChildHeads.length;)for(currentScope=pendingChildHeads.shift();currentScope;)count+=1,pendingChildHeads.push(currentScope.$$childHead),currentScope=currentScope.$$nextSibling;return count}function countWatchers(){for(var currentScope,count=this.$$watchers?this.$$watchers.length:0,pendingChildHeads=[this.$$childHead];pendingChildHeads.length;)for(currentScope=pendingChildHeads.shift();currentScope;)count+=currentScope.$$watchers?currentScope.$$watchers.length:0,pendingChildHeads.push(currentScope.$$childHead),currentScope=currentScope.$$nextSibling;return count}var $rootScopePrototype=Object.getPrototypeOf($delegate);return $rootScopePrototype.$countChildScopes=countChildScopes,$rootScopePrototype.$countWatchers=countWatchers,$delegate}],function(jasmineOrMocha){function InjectorState(){this.shared=!1,this.sharedError=null,this.cleanupAfterEach=function(){return!this.shared||this.sharedError}}if(jasmineOrMocha){var currentSpec=null,injectorState=new InjectorState,annotatedFunctions=[],wasInjectorCreated=function(){return!!currentSpec};angular.mock.$$annotate=angular.injector.$$annotate,angular.injector.$$annotate=function(fn){return"function"!=typeof fn||fn.$inject||annotatedFunctions.push(fn),angular.mock.$$annotate.apply(this,arguments)};var module=window.module=angular.mock.module=function(){function workFn(){if(currentSpec.$injector)throw new Error("Injector already created, can not register a module!");var fn,modules=currentSpec.$modules||(currentSpec.$modules=[]);angular.forEach(moduleFns,function(module){fn=angular.isObject(module)&&!angular.isArray(module)?["$provide",function($provide){angular.forEach(module,function(value,key){$provide.value(key,value)})}]:module,currentSpec.$providerInjector?currentSpec.$providerInjector.invoke(fn):modules.push(fn)})}var moduleFns=Array.prototype.slice.call(arguments,0);return wasInjectorCreated()?workFn():workFn};module.$$beforeAllHook=window.before||window.beforeAll,module.$$afterAllHook=window.after||window.afterAll,module.$$currentSpec=function(to){return 0===arguments.length?to:void(currentSpec=to)},module.sharedInjector=function(){if(!module.$$beforeAllHook||!module.$$afterAllHook)throw Error("sharedInjector() cannot be used unless your test runner defines beforeAll/afterAll");var initialized=!1;module.$$beforeAllHook(function(){if(injectorState.shared)throw injectorState.sharedError=Error("sharedInjector() cannot be called inside a context that has already called sharedInjector()"),injectorState.sharedError;initialized=!0,currentSpec=this,injectorState.shared=!0}),module.$$afterAllHook(function(){initialized?(injectorState=new InjectorState,module.$$cleanup()):injectorState.sharedError=null})},module.$$beforeEach=function(){if(injectorState.shared&&currentSpec&&currentSpec!==this){var state=currentSpec;currentSpec=this,angular.forEach(["$injector","$modules","$providerInjector","$injectorStrict"],function(k){currentSpec[k]=state[k],state[k]=null})}else currentSpec=this,originalRootElement=null,annotatedFunctions=[]},module.$$afterEach=function(){injectorState.cleanupAfterEach()&&module.$$cleanup()},module.$$cleanup=function(){var injector=currentSpec.$injector;if(annotatedFunctions.forEach(function(fn){delete fn.$inject}),currentSpec.$injector=null,currentSpec.$modules=null,currentSpec.$providerInjector=null,currentSpec=null,injector){var $rootElement=injector.get("$rootElement"),rootNode=$rootElement&&$rootElement[0],cleanUpNodes=originalRootElement?[originalRootElement[0]]:[];!rootNode||originalRootElement&&rootNode===originalRootElement[0]||cleanUpNodes.push(rootNode),angular.element.cleanData(cleanUpNodes);var $rootScope=injector.get("$rootScope");$rootScope&&$rootScope.$destroy&&$rootScope.$destroy()}angular.forEach(angular.element.fragments,function(val,key){delete angular.element.fragments[key]}),MockXhr.$$lastInstance=null,angular.forEach(angular.callbacks,function(val,key){delete angular.callbacks[key]}),angular.callbacks.$$counter=0},(window.beforeEach||window.setup)(module.$$beforeEach),(window.afterEach||window.teardown)(module.$$afterEach);var ErrorAddingDeclarationLocationStack=function(e,errorForStack){this.message=e.message,this.name=e.name,e.line&&(this.line=e.line),e.sourceId&&(this.sourceId=e.sourceId),e.stack&&errorForStack&&(this.stack=e.stack+"\n"+errorForStack.stack),e.stackArray&&(this.stackArray=e.stackArray)};ErrorAddingDeclarationLocationStack.prototype=Error.prototype,window.inject=angular.mock.inject=function(){function WorkFn(){var modules=currentSpec.$modules||[],strictDi=!!currentSpec.$injectorStrict;modules.unshift(["$injector",function($injector){currentSpec.$providerInjector=$injector}]),modules.unshift("ngMock"),modules.unshift("ng");var injector=currentSpec.$injector;injector||(strictDi&&angular.forEach(modules,function(moduleFn){"function"==typeof moduleFn&&angular.injector.$$annotate(moduleFn)}),injector=currentSpec.$injector=angular.injector(modules,strictDi),currentSpec.$injectorStrict=strictDi);for(var i=0,ii=blockFns.length;ii>i;i++){currentSpec.$injectorStrict&&injector.annotate(blockFns[i]);try{injector.invoke(blockFns[i]||angular.noop,this)}catch(e){if(e.stack&&errorForStack)throw new ErrorAddingDeclarationLocationStack(e,errorForStack);throw e}finally{errorForStack=null}}}var blockFns=Array.prototype.slice.call(arguments,0),errorForStack=new Error("Declaration Location");if(!errorForStack.stack)try{throw errorForStack}catch(e){}return wasInjectorCreated()?WorkFn.call(currentSpec):WorkFn},angular.mock.inject.strictDi=function(value){function workFn(){if(value!==currentSpec.$injectorStrict){if(currentSpec.$injector)throw new Error("Injector already created, can not modify strict annotations");currentSpec.$injectorStrict=value}}return value=arguments.length?!!value:!0,wasInjectorCreated()?workFn():workFn}}}(window.jasmine||window.mocha),function(){function supportsTouchEvents(){if("_cached"in supportsTouchEvents)return supportsTouchEvents._cached;if(!window.document.createTouch||!window.document.createTouchList)return supportsTouchEvents._cached=!1,!1;try{window.document.createEvent("TouchEvent")}catch(e){return supportsTouchEvents._cached=!1,!1}return supportsTouchEvents._cached=!0,!0}function createTouchEvent(element,eventType,x,y){var evnt=new window.Event(eventType);x=x||0,y=y||0;var touch=window.document.createTouch(window,element,Date.now(),x,y,x,y),touches=window.document.createTouchList(touch);return evnt.touches=touches,evnt}function supportsEventBubblingInDetachedTree(){if("_cached"in supportsEventBubblingInDetachedTree)return supportsEventBubblingInDetachedTree._cached;
supportsEventBubblingInDetachedTree._cached=!1;var doc=window.document;if(doc){var parent=doc.createElement("div"),child=parent.cloneNode();parent.appendChild(child),parent.addEventListener("e",function(){supportsEventBubblingInDetachedTree._cached=!0});var evnt=window.document.createEvent("Events");evnt.initEvent("e",!0,!0),child.dispatchEvent(evnt)}return supportsEventBubblingInDetachedTree._cached}function triggerForPath(element,evnt){var stop=!1,_stopPropagation=evnt.stopPropagation;evnt.stopPropagation=function(){stop=!0,_stopPropagation.apply(evnt,arguments)},patchEventTargetForBubbling(evnt,element);do element.dispatchEvent(evnt);while(!stop&&(element=element.parentNode))}function patchEventTargetForBubbling(event,target){event._target=target,Object.defineProperty(event,"target",{get:function(){return this._target}})}function isAttachedToDocument(element){for(;element=element.parentNode;)if(element===window)return!0;return!1}window.browserTrigger=function(element,eventType,eventData){function pressed(key){return-1!==keys.indexOf(key)}if(element&&!element.nodeName&&(element=element[0]),element){eventData=eventData||{};var relatedTarget=eventData.relatedTarget||element,keys=eventData.keys,x=eventData.x,y=eventData.y,inputType=element.type?element.type.toLowerCase():null,nodeName=element.nodeName.toLowerCase();eventType||(eventType={text:"change",textarea:"change",hidden:"change",password:"change",button:"click",submit:"click",reset:"click",image:"click",checkbox:"click",radio:"click","select-one":"change","select-multiple":"change",_default_:"click"}[inputType||"_default_"]),"option"===nodeName&&(element.parentNode.value=element.value,element=element.parentNode,eventType="change"),keys=keys||[];var evnt;if(/transitionend/.test(eventType))if(window.WebKitTransitionEvent)evnt=new window.WebKitTransitionEvent(eventType,eventData),evnt.initEvent(eventType,!1,!0);else try{evnt=new window.TransitionEvent(eventType,eventData)}catch(e){evnt=window.document.createEvent("TransitionEvent"),evnt.initTransitionEvent(eventType,null,null,null,eventData.elapsedTime||0)}else if(/animationend/.test(eventType))if(window.WebKitAnimationEvent)evnt=new window.WebKitAnimationEvent(eventType,eventData),evnt.initEvent(eventType,!1,!0);else try{evnt=new window.AnimationEvent(eventType,eventData)}catch(e){evnt=window.document.createEvent("AnimationEvent"),evnt.initAnimationEvent(eventType,null,null,null,eventData.elapsedTime||0)}else/touch/.test(eventType)&&supportsTouchEvents()?evnt=createTouchEvent(element,eventType,x,y):/key/.test(eventType)?(evnt=window.document.createEvent("Events"),evnt.initEvent(eventType,eventData.bubbles,eventData.cancelable),evnt.view=window,evnt.ctrlKey=pressed("ctrl"),evnt.altKey=pressed("alt"),evnt.shiftKey=pressed("shift"),evnt.metaKey=pressed("meta"),evnt.keyCode=eventData.keyCode,evnt.charCode=eventData.charCode,evnt.which=eventData.which):(evnt=window.document.createEvent("MouseEvents"),x=x||0,y=y||0,evnt.initMouseEvent(eventType,!0,!0,window,0,x,y,x,y,pressed("ctrl"),pressed("alt"),pressed("shift"),pressed("meta"),0,relatedTarget));if(evnt.$manualTimeStamp=eventData.timeStamp,evnt){var finalProcessDefault,originalPreventDefault=evnt.preventDefault,appWindow=element.ownerDocument.defaultView,fakeProcessDefault=!0,angular=appWindow.angular||{};return angular["ff-684208-preventDefault"]=!1,evnt.preventDefault=function(){return fakeProcessDefault=!1,originalPreventDefault.apply(evnt,arguments)},!eventData.bubbles||supportsEventBubblingInDetachedTree()||isAttachedToDocument(element)?element.dispatchEvent(evnt):triggerForPath(element,evnt),finalProcessDefault=!(angular["ff-684208-preventDefault"]||!fakeProcessDefault),delete angular["ff-684208-preventDefault"],finalProcessDefault}}}}()}(window,window.angular);