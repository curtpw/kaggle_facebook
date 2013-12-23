#!/usr/bin/env node

//"use strict";

var argv = require('optimist').argv;
var request = require('request');
var colors = require('colors');
var strip = require('strip');
 var fs = require('fs');

var csv = require('csv');

//var csv2 = require('ya-csv');

var async = require('async');

var simhash = require('simhash')('md5');

//var process = require('process');

var natural = require('natural'),
  tokenizer = new natural.WordTokenizer();

 //var html_strip = require('htmlstrip-native');

var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var train_db = new Db('train_dataDB', new Server('localhost', 27017), { w: 1 });
var vectorcollection = train_db.collection('vector', { w: 1 });
var tags_not_found = train_db.collection('found', { w: 1 });   //for storing stats on test run against training set
var tags_extra = train_db.collection('extra', { w: 1 });   //for storing stats on test run against training set
var tags_matched = train_db.collection('match', { w: 1 });   //for storing stats on test run against training set
var tags_meta = train_db.collection('meta', { w: 1 });   //for storing stats on test run against training set

tags_not_found.ensureIndex( { "Tag": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping
tags_extra.ensureIndex( { "Tag": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping
tags_matched.ensureIndex( { "Tag": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping
tags_meta.ensureIndex( { "Tag": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping

vectorcollection.ensureIndex( { "Term": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping
//taglist.ensureIndex( { "Tag": 1 }, { unique: true, dropDups: true }, function(error) {  if (error) { console.dir(error); } });     	//make field unique for auto deduping
//vectorcollection.ensureIndex( { "docs": 1 }, { unique: true, dropDups: true }, function(error) {}  );     	//make field unique for auto deduping


Object.size = function(obj) {         //function for getting size of object arrays    -- syntax for use: var x =  Object.size(myArray);
    var size = 0, key;				  
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var Mongo_loader = function() {

	//-----------------------------------------------------------
	function unique(arr) {  //find number of unique terms! er, I mean get matches!
		var hash = {}, result = [], total = 0;
		for ( var i = 0, l = arr.length; i < l; ++i ) {
			if ( !hash.hasOwnProperty(arr[i]) ) { //it works with objects! in FF, at least
				hash[ arr[i] ] = true;
				total++;
			}
		}
		return total;
	}

	//-----------------------------------------------------------


	function genclassifiers() {

		 train_db.open(function(err, train_db) {

		 	async.waterfall([   //time to do things one at a time

			 	function(callback) {  //CREATE CLASSIFIERS

			 		var select_tags = ["null","null"];
			 		
					var natural = require('natural'),
  					title_tag_classifier = ["null","null"];  //[}new natural.BayesClassifier();
  					body_tag_classifier =["null","null"];// new natural.BayesClassifier();

  					var select_tags_raw = ["c#","java","php","javascript","android","jquery","c++","python","iphone","asp.net","mysql","html",".net","ios","objective-c","sql","css","linux","ruby-on-rails","windows","c","sql-server","ruby","wpf","xml","ajax","database","windows-7","asp.net-mvc","regex","osx","xcode","django","arrays","vb.net","facebook","eclipse","ruby-on-rails-3","json","ubuntu","performance","networking","multithreading","winforms","string","visual-studio-2010","asp.net-mvc-3","wcf","bash","security","wordpress","homework","html5","image","visual-studio","algorithm","web-services","linq","sql-server-2008","oracle","git","forms","actionscript-3","perl","query","cocoa","flash","ipad","email","silverlight","spring","apache2","apache","r","hibernate","cocoa-touch","entity-framework","excel","swing","file","shell","api","sqlite","list","flex","tsql","jquery-ui",".htaccess","delphi","internet-explorer","windows-xp","node.js","firefox","debugging","qt","unit-testing","http","windows-phone-7","svn","google-chrome","unix","codeigniter","postgresql","iis","command-line","oop","matlab","sql-server-2005","ssh","google-app-engine","sockets","class","function","parsing","validation","calculus","memory","jsp","xaml","google-maps","templates","events","zend-framework","authentication","scala","android-layout","rest","mvc","tomcat","uitableview","audio","winapi","mongodb","windows-server-2008","real-analysis","pdf","google","magento","url","design-patterns","facebook-graph-api","session","plugins","table","dns","jquery-ajax","nhibernate","sharepoint","search","design","visual-studio-2008","sorting","optimization","logging","jsf","vim","powershell","video","permissions","cakephp","ssl","gwt","java-ee","visual-c++","date","variables","exception","web-applications","css3","probability","centos","drupal","linear-algebra","servlets","c#-4.0","debian","dom","maven","math","testing","vba","browser","gui","caching","object","listview","generics","ios5","inheritance","mod-rewrite","redirect","core-data","haskell","iis7","xslt","phonegap","linq-to-sql","encryption","active-directory","pointers","ms-access","graphics","mac","animation","database-design","gcc","grails","deployment","loops","configuration","layout","activerecord","datetime","backup","fonts","windows-8","windows-server-2003","mobile","div","jquery-mobile","data-binding","opencv","select","serialization","button","memory-management","abstract-algebra","join","post","application","text","stored-procedures","image-processing","opengl","architecture","reflection","printing","cookies","emacs","jpa","login","geometry","hard-drive","macros","installation","nginx","version-control","dynamic","iframe","amazon-ec2","gridview","blackberry","soap","android-intent","netbeans","extjs","proxy","script","file-upload","curl","boost","dll","assembly","data-structures","statistics","backbone.js","user-interface","process","scripting","windows-vista","service","xpath","wireless-networking","combinatorics","analysis","spring-mvc","razor","encoding","canvas","jquery-plugins","iphone-sdk-4.0","javascript-events","mvvm","ftp","graph","filesystems","web","usb","csv","batch","unicode","syntax","binding","routing","random","terminal","heroku","time","algebra-precalculus","entity-framework-4","google-maps-api-3","data","methods","webserver","twitter","map","asp.net-mvc-2","uiview","file-io","general-topology","properties","asynchronous","actionscript","azure","tikz-pgf","types","if-statement","sequences-and-series","joomla","selenium","keyboard",".net-4.0","tcp","dictionary","frameworks","language-agnostic","ant","number-theory","symfony2","jdbc","opengl-es","vpn","com","twitter-bootstrap","asp.net-mvc-4","input","url-rewriting","compiler","uitableviewcell","reporting-services","for-loop","group-theory","collections","utf-8","https","drop-down-menu","memory-leaks","jqgrid","mercurial","svg","functional-analysis","jsf-2","excel-vba","silverlight-4.0","view","tfs","localization","windows-server-2008-r2","virtualization","oauth","matrices","activity","sdk","programming-languages","complex-analysis","batch-file","autocomplete","recursion","colors","formatting","website","2010","coding-style","open-source","hash","groovy","boot","jboss","router","asp-classic","import","parameters","coldfusion","amazon-web-services","jar","uiwebview","static","ip","awk",".net-3.5","xcode4","vector","cron","path","checkbox","struts2","menu","solr","exception-handling","sharepoint2010","uiviewcontroller","matrix","datagrid","navigation","vb6","safari","module","automation","reference-request","filter","concurrency","integration","ruby-on-rails-3.1","connection","django-models","orm","logic","dojo","limit","microsoft-excel","interface","ide","stl","jquery-selectors","error-handling","python-3.x","ado.net","smtp","datagridview","combobox","character-encoding","download","exchange","iptables","hadoop","io","youtube","firewall","dependency-injection","java-me","reference","upload","internet","ios6","functions","casting","python-2.7","charts","3d","numpy","vbscript","github","crash","attributes","comments","elementary-number-theory","uiscrollview","keyboard-shortcuts","raid","virtualbox","internet-explorer-8","android-widget","sed","outlook","multidimensional-array","model","laptop","tabs","kernel","functional-programming","usercontrols","crystal-reports","plsql","pdo","struct","bluetooth","mono","textbox","differential-equations","licensing","delete","background","ldap","gmail","workflow","msbuild","probability-theory","cygwin","mfc","insert","transactions","osx-lion","custom-post-types","integral","c++11","hyperlink","google-chrome-extension","console","drivers","ssis","constructor","air","postfix","foreach","parallel-processing","passwords","measure-theory","monitoring","playframework","ios4","cuda","merge","xhtml","junit","triggers","internationalization","windows-services","webview","maven-2","dialog","rss","graph-theory","lambda","delegates","fedora","binary","android-listview","geolocation","ffmpeg","build","visual-studio-2012","eclipse-plugin","amazon-s3","android-emulator","stream","uinavigationcontroller","primefaces","header","content-management-system","storage","documentation","clojure","algebraic-geometry","migration","find","drag-and-drop","phpmyadmin","rspec","xml-parsing","sqlite3","devise","resources","directory","garbage-collection","event-handling","terminology","user","osx-snow-leopard","gps","linq-to-entities","cocos2d-iphone","resize","tags","remote-desktop","web-config","installer","algorithms","grep","enums","floating-point","webkit","calendar","adobe","controller","compiler-errors","namespaces","xna","compilation","http-headers","yii","oracle10g","callback","timer","linux-kernel","get","arraylist","images","customization","trigonometry","cocos2d","ubuntu-10.04","split","network-programming","tree","hosting","datatable","notifications","f#","rubygems","cryptography","paypal","solaris","seo","angularjs","replace","xsd","android-ndk","knockout.js","hardware","iis6","certificate","php5","doctrine2","development","openssl","drupal-6","themes","group-by","makefile","listbox","partitioning","tables","apple","internet-explorer-9","include","styles","virtual-machine","count","webforms","bitmap","cpu","onclick","django-admin","nsstring","popup","treeview","scope","google-analytics","commutative-algebra","fluent-nhibernate","sql-server-2008-r2","django-templates","lucene","operating-system","uiimageview","scrolling","thread-safety","software-rec","index","applet","annotations","rewrite","lua","differential-geometry","streaming","editor","jvm","upgrade","uibutton","camera","monotouch","ssd","timeout","wsdl","wifi","interop","routes","rotation","environment-variables","port","cross-browser","doctrine","elementary-set-theory","linker","nosql","export","dependencies","compression","load","pagination","subdomain","spring-security","domain","jaxb","64-bit","wix","iterator","gdb","polynomials","glassfish","uikit","tfs2010","synchronization","ef-code-first","mount","indexing","udp","facebook-like","algebraic-topology","comparison","xml-serialization","internet-explorer-7","entity-framework-4.1","freebsd","spacing","memcached","locking","drupal-7","jenkins","widget","zip","cisco","null","fancybox","admin","video-streaming","redhat","scroll","mouse","flex4","microsoft","maps","grid","erlang","icons","gem","window","x86","intellij-idea","qt4","app-store","matplotlib","focus","wmi","copy","asp.net-web-api","soft-question","ssl-certificate"];

  				//	for(var f = 0; f < select_tags_raw.length; f++){
  				//		select_tags.push({"Tag": select_tags_raw[f], "Title_num":0, "Body_num":0});
  				//	}
  	

						console.log("TEST1");

					
				
						callback(null, title_tag_classifier, body_tag_classifier, select_tags);

				/*	});   */
			 		
				},


			 	function(title_tag_classifier, body_tag_classifier, select_tags, callback) {   //TRAIN CLASSIFIERS FROM TRAINING DATA

			 		//var stream = fs.createWriteStream('../../Data/test_algo_against_train.csv', {flags: 'w'}); //create write stream and point towards output file
			 	//	var header = '"Id","Tags"' + '\n';
			 	//	stream.write(header);                                      //manually create header
			 			 	         		
        	/*		var data = {};
		        	var __dirname = '../../Data',
						__inname = '/Train_535_BAYESTRAIN.csv',
						__outname = '/null_out.csv';
					csv()
						.from.path(__dirname+__inname, { delimiter: ',', escape: '"' })
						.to.stream(fs.createWriteStream(__dirname+__outname))
						.transform( function(row){
						  row.unshift(row.pop());
						  return row;
						})   
						.on('record', function(row,index){

							var training_tags = row[0].split(" ");							
							var title = row[2].toLowerCase();
							var body = row[3].toLowerCase();
							
							body = body.slice(0,1000);
							var train_text = title.concat(" ", body);
						//	console.log("TEST2"); */

					/*		console.log("---------------------------------------------------------------------");
							console.log("Tags: " + train_tags);
							console.log("Id: " + Id);
							console.log("Title: " + title);
							console.log("Body: " + body);
							console.log("");   */


					//		async.waterfall([   //time to do things one at a time

					//			function(callback) {    				//PROCESS TEST DATA

									//var the_tags;

								/*	for(var u = 0; u < select_tags.length; u++){    

										if(select_tags[u].Title_num < 10 && training_tags.indexOf(select_tags[u].Tag) === (-1) ){     //CUTT OFF NUMBER OF DOCS USED FOR TRAINING

											title_tag_classifier.addDocument(title, select_tags[u].Tag);	

											select_tags[u].Title_num++;

											if(u === 0)console.log("Training: " + select_tags[u].Tag);

											
										}

										if(select_tags[u].Body_num < 10 && training_tags.indexOf(select_tags[u].Tag) === (-1) ){     //CUTT OFF NUMBER OF DOCS USED FOR TRAINING

											body_tag_classifier.addDocument(body, select_tags[u].Tag);	

											select_tags[u].Body_num++;

											if(u === 0)console.log("Training: " + select_tags[u].Tag);

											
										}

									}
									body_tag_classifier.train();	
									title_tag_classifier.train();  */
																	   								
						/*			callback(null,select_tags,title_tag_classifier, body_tag_classifier);
								},

								function(select_tags,title_tag_classifier, body_tag_classifier,callback) {       //TEST AGAINST TRAINING TAGS
						
									for(var r= 0; r < training_tags.length; r++){
																																									
									}

									callback(null,select_tags);

								},

								function(callback) {       //WRITE TO OUTPUT FILE

									//callback();
								}]);   
									

						})
						.on('close', function(count){
						  // when writing to a file, use the 'close' event
						  // the 'end' event may fire before the file has been written
						  body_tag_classifier.save('../classifiers/body_tag_classifier.json', function(err, classifier) {   });
						  title_tag_classifier.save('../classifiers/title_tag_classifier.json', function(err, classifier) {  callback(null,title_tag_classifier, body_tag_classifier);  });
						 // setTimeout(function() { stream.close(); }, 10000); 
						  
						})
						.on('error', function(error){
						  console.log(error.message);
						});  

				},

			 	function(title_tag_classifier, body_tag_classifier, callback) {   //LOAD CLASSIFIER *** MUST COMMENT OUT WHEN GENERATING! */

			 /*		var natural = require('natural'),
  						tag_classifier = new natural.BayesClassifier();

			 		natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
			 			tag_classifier = classifier
					    console.log(classifier.classify('long SUNW'));
					    console.log(classifier.classify('short SUNW'));
					});  */

			 		
			 		
			 		// setTimeout(function() { console.log("**Finished training classifiers**"); train_db.close(); }, 1000); 

				callback(null, title_tag_classifier, body_tag_classifier);

				},    

			 	function(title_tag_classifier, body_tag_classifier, callback) {   //SAVE CLASSIFIERS

			 									var select_tags_raw = ["c#","java","php","javascript","android","jquery","c++","python","iphone","asp.net","mysql","html",".net","ios","objective-c","sql","css","linux","ruby-on-rails","windows","c","sql-server","ruby","wpf","xml","ajax","database","windows-7","asp.net-mvc","regex","osx","xcode","django","arrays","vb.net","facebook","eclipse","ruby-on-rails-3","json","ubuntu","performance","networking","multithreading","winforms","string","visual-studio-2010","asp.net-mvc-3","wcf","bash","security","wordpress","homework","html5","image","visual-studio","algorithm","web-services","linq","sql-server-2008","oracle","git","forms","actionscript-3","perl","query","cocoa","flash","ipad","email","silverlight","spring","apache2","apache","r","hibernate","cocoa-touch","entity-framework","excel","swing","file","shell","api","sqlite","list","flex","tsql","jquery-ui",".htaccess","delphi","internet-explorer","windows-xp","node.js","firefox","debugging","qt","unit-testing","http","windows-phone-7","svn","google-chrome","unix","codeigniter","postgresql","iis","command-line","oop","matlab","sql-server-2005","ssh","google-app-engine","sockets","class","function","parsing","validation","calculus","memory","jsp","xaml","google-maps","templates","events","zend-framework","authentication","scala","android-layout","rest","mvc","tomcat","uitableview","audio","winapi","mongodb","windows-server-2008","real-analysis","pdf","google","magento","url","design-patterns","facebook-graph-api","session","plugins","table","dns","jquery-ajax","nhibernate","sharepoint","search","design","visual-studio-2008","sorting","optimization","logging","jsf","vim","powershell","video","permissions","cakephp","ssl","gwt","java-ee","visual-c++","date","variables","exception","web-applications","css3","probability","centos","drupal","linear-algebra","servlets","c#-4.0","debian","dom","maven","math","testing","vba","browser","gui","caching","object","listview","generics","ios5","inheritance","mod-rewrite","redirect","core-data","haskell","iis7","xslt","phonegap","linq-to-sql","encryption","active-directory","pointers","ms-access","graphics","mac","animation","database-design","gcc","grails","deployment","loops","configuration","layout","activerecord","datetime","backup","fonts","windows-8","windows-server-2003","mobile","div","jquery-mobile","data-binding","opencv","select","serialization","button","memory-management","abstract-algebra","join","post","application","text","stored-procedures","image-processing","opengl","architecture","reflection","printing","cookies","emacs","jpa","login","geometry","hard-drive","macros","installation","nginx","version-control","dynamic","iframe","amazon-ec2","gridview","blackberry","soap","android-intent","netbeans","extjs","proxy","script","file-upload","curl","boost","dll","assembly","data-structures","statistics","backbone.js","user-interface","process","scripting","windows-vista","service","xpath","wireless-networking","combinatorics","analysis","spring-mvc","razor","encoding","canvas","jquery-plugins","iphone-sdk-4.0","javascript-events","mvvm","ftp","graph","filesystems","web","usb","csv","batch","unicode","syntax","binding","routing","random","terminal","heroku","time","algebra-precalculus","entity-framework-4","google-maps-api-3","data","methods","webserver","twitter","map","asp.net-mvc-2","uiview","file-io","general-topology","properties","asynchronous","actionscript","azure","tikz-pgf","types","if-statement","sequences-and-series","joomla","selenium","keyboard",".net-4.0","tcp","dictionary","frameworks","language-agnostic","ant","number-theory","symfony2","jdbc","opengl-es","vpn","com","twitter-bootstrap","asp.net-mvc-4","input","url-rewriting","compiler","uitableviewcell","reporting-services","for-loop","group-theory","collections","utf-8","https","drop-down-menu","memory-leaks","jqgrid","mercurial","svg","functional-analysis","jsf-2","excel-vba","silverlight-4.0","view","tfs","localization","windows-server-2008-r2","virtualization","oauth","matrices","activity","sdk","programming-languages","complex-analysis","batch-file","autocomplete","recursion","colors","formatting","website","2010","coding-style","open-source","hash","groovy","boot","jboss","router","asp-classic","import","parameters","coldfusion","amazon-web-services","jar","uiwebview","static","ip","awk",".net-3.5","xcode4","vector","cron","path","checkbox","struts2","menu","solr","exception-handling","sharepoint2010","uiviewcontroller","matrix","datagrid","navigation","vb6","safari","module","automation","reference-request","filter","concurrency","integration","ruby-on-rails-3.1","connection","django-models","orm","logic","dojo","limit","microsoft-excel","interface","ide","stl","jquery-selectors","error-handling","python-3.x","ado.net","smtp","datagridview","combobox","character-encoding","download","exchange","iptables","hadoop","io","youtube","firewall","dependency-injection","java-me","reference","upload","internet","ios6","functions","casting","python-2.7","charts","3d","numpy","vbscript","github","crash","attributes","comments","elementary-number-theory","uiscrollview","keyboard-shortcuts","raid","virtualbox","internet-explorer-8","android-widget","sed","outlook","multidimensional-array","model","laptop","tabs","kernel","functional-programming","usercontrols","crystal-reports","plsql","pdo","struct","bluetooth","mono","textbox","differential-equations","licensing","delete","background","ldap","gmail","workflow","msbuild","probability-theory","cygwin","mfc","insert","transactions","osx-lion","custom-post-types","integral","c++11","hyperlink","google-chrome-extension","console","drivers","ssis","constructor","air","postfix","foreach","parallel-processing","passwords","measure-theory","monitoring","playframework","ios4","cuda","merge","xhtml","junit","triggers","internationalization","windows-services","webview","maven-2","dialog","rss","graph-theory","lambda","delegates","fedora","binary","android-listview","geolocation","ffmpeg","build","visual-studio-2012","eclipse-plugin","amazon-s3","android-emulator","stream","uinavigationcontroller","primefaces","header","content-management-system","storage","documentation","clojure","algebraic-geometry","migration","find","drag-and-drop","phpmyadmin","rspec","xml-parsing","sqlite3","devise","resources","directory","garbage-collection","event-handling","terminology","user","osx-snow-leopard","gps","linq-to-entities","cocos2d-iphone","resize","tags","remote-desktop","web-config","installer","algorithms","grep","enums","floating-point","webkit","calendar","adobe","controller","compiler-errors","namespaces","xna","compilation","http-headers","yii","oracle10g","callback","timer","linux-kernel","get","arraylist","images","customization","trigonometry","cocos2d","ubuntu-10.04","split","network-programming","tree","hosting","datatable","notifications","f#","rubygems","cryptography","paypal","solaris","seo","angularjs","replace","xsd","android-ndk","knockout.js","hardware","iis6","certificate","php5","doctrine2","development","openssl","drupal-6","themes","group-by","makefile","listbox","partitioning","tables","apple","internet-explorer-9","include","styles","virtual-machine","count","webforms","bitmap","cpu","onclick","django-admin","nsstring","popup","treeview","scope","google-analytics","commutative-algebra","fluent-nhibernate","sql-server-2008-r2","django-templates","lucene","operating-system","uiimageview","scrolling","thread-safety","software-rec","index","applet","annotations","rewrite","lua","differential-geometry","streaming","editor","jvm","upgrade","uibutton","camera","monotouch","ssd","timeout","wsdl","wifi","interop","routes","rotation","environment-variables","port","cross-browser","doctrine","elementary-set-theory","linker","nosql","export","dependencies","compression","load","pagination","subdomain","spring-security","domain","jaxb","64-bit","wix","iterator","gdb","polynomials","glassfish","uikit","tfs2010","synchronization","ef-code-first","mount","indexing","udp","facebook-like","algebraic-topology","comparison","xml-serialization","internet-explorer-7","entity-framework-4.1","freebsd","spacing","memcached","locking","drupal-7","jenkins","widget","zip","cisco","null","fancybox","admin","video-streaming","redhat","scroll","mouse","flex4","microsoft","maps","grid","erlang","icons","gem","window","x86","intellij-idea","qt4","app-store","matplotlib","focus","wmi","copy","asp.net-web-api","soft-question","ssl-certificate"];

			 		var add_keyword_search_list = require('../classifiers/ranked_tag_compliled_big.js');
			 		var dictionary = require('../classifiers/common_word_dict.js');

			 		add_keyword_search_list = add_keyword_search_list.thetags;

			 		var tempaddkey = [];
			 		var add_keyword_search_list = [];
			 		var add_keyword_search_list_filtered = [];


			 		for(var v=0; v < add_keyword_search_list.length; v++){


			 			if( tagstop(add_keyword_search_list[v]) === true  && stopword(add_keyword_search_list[v]) ===  false){

			 				if(dictionary.indexOf(add_keyword_search_list[v]) === (-1)) tempaddkey.push(add_keyword_search_list[v]);



			 		/*		tempaddkey.push(add_keyword_search_list[v]);

			 				if(add_keyword_search_list[v].indexOf(".")  === true || add_keyword_search_list[v].indexOf("-")  === true || add_keyword_search_list[v].indexOf("!")  === true || add_keyword_search_list[v].indexOf("$")  === true || add_keyword_search_list[v].indexOf("#")  === true || add_keyword_search_list[v].length > 10 || add_keyword_search_list[v].indexOf("2") === true || add_keyword_search_list[v].indexOf("1") === true || add_keyword_search_list[v].indexOf("3") === true || add_keyword_search_list[v].indexOf("4") === true || add_keyword_search_list[v].indexOf("5") === true ||add_keyword_search_list[v].indexOf("6") === true || add_keyword_search_list[v].indexOf("7") === true || add_keyword_search_list[v].indexOf("8") === true || add_keyword_search_list[v].indexOf("9")){

			 					add_keyword_search_list_filtered.push(add_keyword_search_list[v]);
			 				}

							*/

			 			}
			 		}
			 		add_keyword_search_list = tempaddkey;


			 		var tempselect = [];
			 		select_tags_raw_filtered = [];
			 		for(var c=0; c < select_tags_raw.length; c++){

			 			if(tagstop(select_tags_raw[c]) === true  && stopword(select_tags_raw[c]) ===  false){
			 				tempselect.push(select_tags_raw[c]);

			 				if(select_tags_raw[c].indexOf(".")  === true || select_tags_raw[c].indexOf("-")  === true){
			 					tempselect.push(select_tags_raw[c]);

			 				
			 				}


			 			}



			 		}
			 		select_tags_raw = tempselect;


					var stream = fs.createWriteStream('../../Data/improved_superkeys_bigdicttopoff.csv', {flags: 'w'}); //create write stream and point towards output file

				//	var streamtrain = fs.createWriteStream('../../Data/TRAIN_DATA_TAGS.csv', {flags: 'w'}); //create write stream and point towards output file
			 	//	var header = '"Id","Tags"' + '\n';
			 	//	stream.write(header);                                      //manually create header
			 			 	         		
        			var data = {};
		        	var __dirname = '../../Data',
						__inname = '/Test_4d.csv',
						__outname = '/null_out.csv';
					csv()
						.from.path(__dirname+__inname, { delimiter: ',', escape: '"' })
						.to.stream(fs.createWriteStream(__dirname+__outname))
						//.to.array(function(data){    })
						.transform( function(row){
						  row.unshift(row.pop());
						  return row;
						})   
						.on('record', function(row,index){

							
							var Id = row[1];
							var title = row[2].toLowerCase();
							var body = row[0].toLowerCase();
							body = body.slice(0,1000);
							var combined_text = title.concat(" ", body);

							var title_cutoff = 1.1;
							var body_cutoff = 2.8;


						//	console.log("ID " + Id);
						//	console.log("TITLE " + title);
						//	console.log("BODY" + body);						

							async.waterfall([   //time to do things one at a time

								function(callback) {    				//PROCESS TEST DATA





					
									//console.log(taglist[3]);

									var found_tags = [];
									var total_score=0;
									var average_score=0;


															


								/*	if(found_tags.length > 5){
								        for(var w = 0; w < found_tags.length-1; w++){								      

									        for(var g = 1; g < found_tags.length + 1; g++){
									        	
									        	if(found_tags[g] === undefined){}

									            else if(found_tags[g-1].value < found_tags[g].value){

									            	found_tags.splice(g-1,0,found_tags[g]);
									            	found_tags.splice(g+1,1);				            						                		
									            }  
									        }			               
									   }
									   found_tags = found_tags.slice(0,5);
									}
									else{  */



							

								for(var y = 0; y < select_tags_raw.length; y++){

									searchterm = select_tags_raw[y].replace("-"," ");

									if( found_tags.length < 5 ){

										


										if( found_tags.indexOf(select_tags_raw[y]) === (-1) && title.indexOf(" " + searchterm + " ") !== (-1)  ){

											found_tags.push(select_tags_raw[y]);  
										}




										else if(found_tags.indexOf(select_tags_raw[y]) === (-1) && body.indexOf(" " + searchterm + " ") !== (-1)  ){

											found_tags.push(select_tags_raw[y]);  
										}

									//	else if( (searchterm.indexOf(".")  === true || select_tags_raw[y].indexOf("-")  === true )  && searchterm.length > 5 && found_tags.indexOf(select_tags_raw[y]) === (-1) ){

											if(body.indexOf(" " + searchterm + " ") !== (-1)  && found_tags.indexOf(select_tags_raw[y]) === (-1) ){

												found_tags.push(select_tags_raw[y]);  
											}

											//else if(body.indexOf("" + searchterm + "") !== (-1) && searchterm.length > 5 ){

											//	found_tags.push(select_tags_raw[y]);
											//}

										//} 
									}

								}  

								

								for(var h = 0; h < add_keyword_search_list.length;h++){

									searchterm = add_keyword_search_list[h].replace("-"," ");

									if(found_tags.indexOf(add_keyword_search_list[h]) === (-1)  && found_tags.length < 5  && tagstop(searchterm) === true ){

										


										if(title.indexOf(" " + searchterm + " ") !== (-1)   ){

											found_tags.push(add_keyword_search_list[h]);   
										}




										//else if(    (searchterm.indexOf(".")  === true || add_keyword_search_list[h].indexOf("-")  === true )     && searchterm.length > 5 && found_tags.indexOf(add_keyword_search_list[h]) === (-1) ){
											searchterm = add_keyword_search_list[h].replace("-"," ");
											//searchterm = add_keyword_search_list_filtered[h].replace("-"," ");
											if(title.indexOf("" + searchterm + "") !== (-1)  && found_tags.indexOf(add_keyword_search_list_filtered[h]) === (-1)){

												//found_tags.push(add_keyword_search_list_filtered[h]); 
												found_tags.push(add_keyword_search_list[h]);   
											}


											else if(body.indexOf(" " + searchterm + " ") !== (-1) && found_tags.indexOf(add_keyword_search_list_filtered[h]) === (-1) ){

												//found_tags.push(add_keyword_search_list_filtered[h]);  
												found_tags.push(add_keyword_search_list[h]);  
											}

											else if(body.indexOf("" + searchterm + "") !== (-1) && found_tags.indexOf(add_keyword_search_list_filtered[h]) === (-1)){

												//found_tags.push(add_keyword_search_list_filtered[h]); 
												found_tags.push(add_keyword_search_list[h]);  
											}
										//}  
									}


								} 
								
								if(found_tags.indexOf("javascript") === (-1) && (body.indexOf(" js ") != (-1) || title.indexOf("js") != (-1)) ){ found_tags.push("javascript"); }

																
									callback(null, found_tags, Id);
								},

								function(found_tags, Id, callback) {       //TEST AGAINST TRAINING TAGS
									//console.log("TEST****99999");
									foundtags = found_tags.slice(0,5);

									found_tags = found_tags.join(" ");

				                    if(Id === "Id"){ Id = '"Id"'; the_tags = 'Tags'; }

									callback(null, found_tags, Id);
								},

								function(found_tags, Id, callback) {       //TEST AGAINST TRAINING TAGS

									stream.write(Id + ',"' + found_tags + '"' + '\n');  //***WRITE TO OUTPUT CSV FILE

									//streamtrain.write(Id + ',"' + row[0] + '"' + '\n'); 

                  					console.log("WRITE:" + Id + ',"' + found_tags + '"' + '\n'); 

									callback();
						
								}]);   
									

						})
						.on('close', function(count){
						  // when writing to a file, use the 'close' event
						  // the 'end' event may fire before the file has been written
						 setTimeout(function() { stream.close(); }, 30000); 
						  callback();


						})
						.on('error', function(error){
						  console.log(error.message);
						});  



				}]);	

			}); 
    } 						
							
							
	//-----------------------------------------------------------

	function validate() {

		 train_db.open(function(err, train_db) {

		 	async.waterfall([   //time to do things one at a time

			 	function(callback) {   //LOAD SIMPLE DICTIONARY INTO ARRAY

			 	var taglist = [{"Tag" : "c#"},
  					{"Tag" : "java"},
  					{"Tag" : "php"},
  					{"Tag" : "javascript"},
  					{"Tag" : "android"},
  					{"Tag" : "jquery"},
  					{"Tag" : "c++"},
  					{"Tag" : "python"},
  					{"Tag" : "iphone"},
  					{"Tag" : "asp.net"},
  					{"Tag" : "mysql"},
  					{"Tag" : "html"},
  					{"Tag" : ".net"},
  					{"Tag" : "ios"},
  					{"Tag" : "objective-c"},
  					{"Tag" : "sql"},
  					{"Tag" : "css"},
  					{"Tag" : "linux"},
  					{"Tag" : "ruby-on-rails"},
  					{"Tag" : "windows"},
  					{"Tag" : "c"},
  					{"Tag" : "sql-server"},
  					{"Tag" : "ruby"},
  					{"Tag" : "wpf"},
  					{"Tag" : "xml"},
  					{"Tag" : "ajax"},
  					{"Tag" : "database"},
  					{"Tag" : "windows-7"},
  					{"Tag" : "asp.net-mvc"},
  					{"Tag" : "regex"}];
  					var natural = require('natural'),
  					csharp_classifier = new natural.BayesClassifier();

  		
				csharp_classifier.load('../classifiers/csharp_classifier.json', null, function(err, the_classifier) { taglist[0].Bayes=the_classifier; });
		/*	 	natural.BayesClassifier.load('../classifiers/javajava_classifier.json', null, function(err, the_classifier) { taglist[1].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/php_classifier.json', null, function(err, the_classifier) { taglist[2].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/javascript_classifier.json', null, function(err, the_classifier) { taglist[3].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/android_classifier.json', null, function(err, the_classifier) { taglist[4].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/jquery_classifier.json', null, function(err, the_classifier) { taglist[5].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/cplusplus_classifier.json', null, function(err, the_classifier) { taglist[6].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/python_classifier.json', null, function(err, the_classifier) { taglist[7].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/iphone_classifier.json', null, function(err, the_classifier) { taglist[8].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/aspnet_classifier.json', null, function(err, the_classifier) { taglist[9].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/mysql_classifier.json', null, function(err, the_classifier) { taglist[10].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/html_classifier.json', null, function(err, the_classifier) { taglist[11].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/net_classifier.json', null, function(err, the_classifier) { taglist[12].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/ios_classifier.json', null, function(err, the_classifier) { taglist[13].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/objectivec_classifier.json', null, function(err, the_classifier) { taglist[14].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/sql_classifier.json', null, function(err, the_classifier) { taglist[15].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/css_classifier.json', null, function(err, the_classifier) { taglist[16].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/linux_classifier.json', null, function(err, the_classifier) { taglist[17].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/rubyonrails_classifier.json', null, function(err, the_classifier) { taglist[18].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/windows_classifier.json', null, function(err, the_classifier) { taglist[19].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/c_classifier.json', null, function(err, the_classifier) { taglist[20].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/sqlserver_classifier.json', null, function(err, the_classifier) { taglist[21].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/ruby_classifier.json', null, function(err, the_classifier) { taglist[22].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/wpf_classifier.json', null, function(err, the_classifier) { taglist[23].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/xml_classifier.json', null, function(err, the_classifier) { taglist[24].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/ajax_classifier.json', null, function(err, the_classifier) { taglist[25].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/database_classifier.json', null, function(err, the_classifier) { taglist[26].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/windows7_classifier.json', null, function(err, the_classifier) { taglist[27].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/aspnetmvc_classifier.json', null, function(err, the_classifier) { taglist[28].Bayes=the_classifier; }),
			 	natural.BayesClassifier.load('../classifiers/regex_classifier.json', null, function(err, the_classifier) { taglist[29].Bayes=the_classifier; }); */

					var the_taglist = [];
					the_taglist = require('../../Data/top_tag_list_top_10624_sorted_jsvar.js');  //EXTERNAL TAG LIST SORTED AND CUT BY FREQUENCY IN TRAIN DATA
					the_taglist=the_taglist.thetags;
				
						callback(null, the_taglist);
			 		
				},


			 	function(taglist, callback) {   //PROCESS TEST SET IN CSV STREAM

			 		var stream = fs.createWriteStream('../../Data/test_bayes_against_train.csv', {flags: 'w'}); //create write stream and point towards output file
			 	//	var header = '"Id","Tags"' + '\n';
			 	//	stream.write(header);                                      //manually create header
			 			 	         		
        			var data = {};
		        	var __dirname = '../../Data',
						__inname = '/Train.csv',
						__outname = '/null_out.csv';
					csv()
						.from.path(__dirname+__inname, { delimiter: ',', escape: '"' })
						.to.stream(fs.createWriteStream(__dirname+__outname))
						//.to.array(function(data){    })
						.transform( function(row){
						  row.unshift(row.pop());
						  return row;
						})   
						.on('record', function(row,index){

							var training_tags = row[0].split(" ");
							var Id = row[1];
							var title = row[2].toLowerCase();
							var body = row[3].toLowerCase();
							var title_candidates = [];
							var body_candidates = [];
							var combined_text = title.concat(" ", body);

							var missed_count = 0;
							var extra_count = 0;
							var matched_count = 0;

					

							async.waterfall([   //time to do things one at a time

								function(callback) {    				//PROCESS TEST DATA
									//console.log(taglist[3]);

									var the_tags;

									var test_tag;

									for(var u = 0; u < taglist.length; u++){    //FIND CANDIDATE TAGS IN TEST ROW
										taglist[u].Score = 0.12345;
										

										if(combined_text.indexOf(taglist[u].Tag) === (-1)){   //TEMPORARY STOP WORD FILTERS, REMOVE FROM DICTIONARY DB COLLECTION INSTEAD BEFORE PRODUCTION
											
											
											var classify_out =  taglist[u].Bayes.classify(combined_text);


											taglist[u].Score = classify_out[0].value;
											

											console.log("-----------------------------");
											console.log("TITLE: " + title);
											console.log(  classify_out );

										/*	if(taglist[u].indexOf("-") != (-1)) test_tag = taglist[u].replace("-"," ");
											else test_tag = taglist[u];

											if(title.indexOf("" + test_tag + "") != (-1) ){
												title_candidates.push(taglist[u]); 
											//	console.log("Title candidate: " + taglist[u] + "  in  TITLE: " + row[1]);
											} 

											else if(body.indexOf(" " + test_tag + " ") != (-1)     ){
												body_candidates.push(taglist[u]); 
											//	console.log("Body candidate: " + taglist[u] + "  in  TITLE: " + row[1]);
											} */

										} 

									}
								   

								//	console.log("TITLE TAGS: " + title_candidates);
								//	console.log("BODY TAGS: " + body_candidates);

								//	found_tags = title_candidates.concat(body_candidates);

									//console.log(Id);
									callback(null, taglist, Id);
								},

								function(taglist, Id, callback) {       //TEST AGAINST TRAINING TAGS


											for(var s = 0; s < taglist.length; s++){

												if(taglist[s].Score !==(0.12345)){	//generated tag not found in train tags

												//	tag_extra.push(found_tags[s]); 
													extra_count++;

													

											//		tags_extra.update({ Tag: taglist[s].Tag },    //write to workhorse data science dictionary
											//		{	
											//			$inc: { Num: 1 }
											//		}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } });  

													tags_meta.update({ Tag: taglist[s].Tag },    //write to workhorse data science dictionary
													{	
														$inc: { Extra: 1 }
													}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } });  
												} 
											}

									callback(null, taglist, Id);
								},

								function(taglist, Id, callback) {       //TEST AGAINST TRAINING TAGS


									var tag_not_found = [];
									var tag_extra = [];
									var match_tag = [];

								//	console.log("TEST1" + found_tags);

							/*		for(var r= 0; r < training_tags.length; r++){


									

											if(found_tags.indexOf(training_tags[r]) === (-1)){   //train tag not found in generated tags

											//	tag_not_found.push(training_tags[r]);
												missed_count++;

												tags_not_found.update({ Tag: training_tags[r] },    //write to workhorse data science dictionary
												{	
													$inc: { Num: 1 }
												}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } });  

												tags_meta.update({ Tag: training_tags[r] },    //write to workhorse data science dictionary
												{	
													$inc: { Missed: 1 }
												}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } });  

											}  
											else if(found_tags.indexOf(training_tags[r]) != (-1)){

											//	match_tag.push(found_tags[s]);
												matched_count++;
												console.log("Matched tag: " + training_tags[r]); 

												tags_matched.update({ Tag: training_tags[r] },    //write to workhorse data science dictionary
												{	
													$inc: { Num: 1 }
												}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } }); 

												tags_meta.update({ Tag: training_tags[r] },    //write to workhorse data science dictionary
												{	
													$inc: { Matched: 1 }
												}, {upsert: true}, function (err, document){ if (err) { console.dir(err); } });   

											}   									
											
								
									}  */

							/*		console.log("");
									console.log("----------------------------");
									console.log("#TAGS IN TRAIN ITEM: " + training_tags.length);
									console.log("#TAGS FOUND IN ITEM: " + found_tags.length);
									console.log("MISSED: " + missed_count);
									console.log("EXTRA: " + extra_count);
									console.log("MATCHES: " + matched_count);
									console.log("TRAINING TAGS: " + training_tags);
									console.log("GENERATED TAGS: " + found_tags);
									//console.log("TITLE: " + title);
									//console.log("BODY: " + body);

									var accuracy=0;
									var accuracy_plus_missed=0;

									if(matched_count>0){
										console.log("ACCURACY: " + matched_count/(missed_count + extra_count) );
										accuracy_plus_missed = matched_count/(missed_count + extra_count);
										accuracy = matched_count/missed_count;
									}
									else{

										console.log("ACCURACY: 0"); 
									}  */
									callback(null, matched_count, missed_count , extra_count);

								},

								function( matched_count, missed_count , extra_count, callback) {       //WRITE TO OUTPUT FILE

							/*		tags_matched.update({ Tag: "GLAMDRING77216" },    //write to workhorse data science dictionary
									{	
													$inc: { Matched: matched_count },
													$inc: { Missed: missed_count },
													$inc: { Extra: extra_count }
									}, {upsert: true}, function (err, document){
									 	if (err) { console.dir(err); } 

									 	tags_matched.find({Tag: "GLAMDRING77216"}).toArray(function(err, items) {

							                if (err) { console.dir(err); }
							                var total_accuracy_plus_extra = items[0].Matched / (items[0].Missed + items[0].Extra); 
							                var total_accuracy = items[0].Matched / items[0].Missed; 

							                if (items.length === 0) { console.log('Empty here :('); }


							               
											
											console.log("TOTAL ACCURACY: " + total_accuracy);
											console.log("TOTAL ACCURACY + EXTRA: " + total_accuracy_plus_extra);
											
							              
											 //setTimeout(function() { train_db.close(); }, 1000); 
							            });


									});  */

									//console.log(the_tags);
								
/*
									stream.write(Id + ',"' + the_tags + '"' + '\n');  //***WRITE TO OUTPUT CSV FILE

									console.log(Id + ',"' + the_tags + '"' + '\n');   */

									//if( Id/100 === Math.round(Id/100) ) console.log(Id + ',"' + the_tags + '"' + '\n');   //test output every 100 writes

									callback();

								}]);   
									

						})
						.on('close', function(count){
						  // when writing to a file, use the 'close' event
						  // the 'end' event may fire before the file has been written
						  stream.close();
						  callback();


						})
						.on('error', function(error){
						  console.log(error.message);
						});  

				
				}]);	

			}); 
    } 		
    

    //-----------------------------------------------------------

     function vectorlist() {
     	console.log("CHECK VECTOR MAP");

        train_db.open(function(err, train_db) {

            if (err) { console.dir(err); }

            console.log('Document vector map terms'.yellow.bold);

            vectorcollection.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

                if (items.length === 0) { console.log('Empty here :('); }


                console.log("First 50 entried:");
                for (var i = 100; i < 1150 ; i++) { //display as you go //DISPLAY LAST 5

					console.log('- - - - - - - - - - - - - - - -');
					//console.log(items[i].title.bold);	
					console.log(items[i]);   						
                }  
				
				console.log('Number of terms in document vector map: ' + items.length);
				
               setTimeout(function() { train_db.close(); }, 1000); 

            });
        });
    } 	

      //-----------------------------------------------------------

     function reportlist() {


     	var top_not_found = [];
     	var top_extra = [];
     	var top_matched = [];
     	var top_tags = [];

        train_db.open(function(err, train_db) {

            if (err) { console.dir(err); }

            var above_print = 1;

          //  console.log('Document vector map terms'.yellow.bold);
        	async.waterfall([   //time to do things one at a time

			 	function(callback) {   									//PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  

		           // tags_not_found.find().toArray(function(err, items) {
		            tags_not_found.find().toArray(function(err, items) {

		                if (err) { console.dir(err); }
		                if (items.length === 0) { console.log('Empty here :('); }

		                
		                callback(null, items);

		            });
		        },	        

					 		function(items, callback) {   //LOAD SIMPLE DICTIONARY INTO ARRAY

				                for (i in items) { //display as you go //DISPLAY LAST 5

				                	if(items[i].Num > above_print){ top_tags.push(items[i]); /*console.log('"' + items[i].Tag + '",');  */ }		

								}

								var total_list_length = items.length;

		                 		callback(null, total_list_length, top_tags);

							},

							function(total_list_length, top_tags, callback) {       //PROCESS TEST DATA					

								top_tags.push({Term: "BLANKS", Num: [0]});  //blank end for sorting

								var temp;
						        for(var w = 0; w < top_tags.length-1; w++){
							        var temp;

							        for(var g = 1; g < top_tags.length + 1; g++){
							        	
							        	if(top_tags[g] === undefined){}

							            else if(top_tags[g-1].Num < top_tags[g].Num){

							            	top_tags.splice(g-1,0,top_tags[g]);
							            	top_tags.splice(g+1,1);				            						                		
							            }  
							        }			               
							    }

							    callback(null, total_list_length, top_tags);
							},

							function(total_list_length, top_tags, callback) {       //PROCESS TEST DATA

								var text_out="";	
								var the_results = [];
								console.log("TEST" + top_tags[2].Tag + top_tags[2].Num);				

								for(var t = 0; t < (top_tags.length - 1); t++){             
							     //   console.log(top_tags[t].Tag + " , " + top_tags[t].Num);   	
							       // text_out = text_out + '"' +  top_tags[t].Tag + '",';	
							       the_results.push( {"Tag" : top_tags[t].Tag, "Num" : top_tags[t].Num, "Match" : 99999} );
								}	
							
					         	callback(null,total_list_length, the_results);

							},
										

					        function(total_list_length, the_results, callback) {       //PROCESS TEST DATA

					        	var decide = true;
					        	var matched_results = [];
					        	var text_out;


							/*	for(var g = 0; g < the_results.length ; g++){

									tags_extra.find({"Tag": the_results[g].Tag}).toArray(function(err, matches_item) {

										if (err) { console.dir(err); console.log("GET OUT OF HERE!!!"); decide = false;}

										else if (matches_item.length > 1) { console.log("ERROR IN MATCH QUERY"); }

										else if(matches_item[0] === undefined || matches_item[0].Num === undefined){ console.log("BIG ERROR"); }

										else //if( decide === true)
										{ 
											console.log(matches_item[0].Num);

											matched_results.push ({"Tag" : the_results[g].Tag, "Num" : the_results[g].Num, "Match" : matches_item[0].Num});
											console.log("Tag: " + the_results[g].Tag +  " Num: " + the_results[g].Num +  " Match: " + matches_item[0].Num);						

											
							        	}
							        	if(decide === false || g === the_results.length){   */

											//	for(var e = 0; e < the_results.length; e++){
									         //       console.log("Missed: " + the_results[e].Tag + " # missed: " + the_results[e].Num + "  # matched: " + the_results[e].Match);
									         //   }


									       //     console.log("Number of not found that occur above " + above_print + " : " + the_results.length);
											//	console.log('Number of terms in not found list: ' + total_list_length);

													
												
												

												for(var e = 0; e < the_results.length; e++){
									                console.log("Missed: " + the_results[e].Tag + " #: " + the_results[e].Num);
									           //     text_out = text_out + '{"Tag" : "' + the_results[e].Tag + '","Number" : ' + the_results[e].Num + '},' ;
									            }     

									      /*      fs.writeFile('../../Data/top_tag_missed_sorted.txt', text_out, function(err) {
													if(err) {
													    console.log(err);
													} else {
													    console.log("The file was saved!");
													}
												});   */

									            console.log("Total above limit: " + the_results.length);  										

									    /*     	callback();	
								        	}
									});		
										
								}		*/					

					        }]);												
				});
	}



//-----------------------------------------------------------

 function metareportlist() {


     	var top_not_found = [];
     	var top_extra = [];
     	var top_matched = [];
     	var top_tags = [];

        train_db.open(function(err, train_db) {

            if (err) { console.dir(err); }

            var above_print = 1;

          //  console.log('Document vector map terms'.yellow.bold);
        	async.waterfall([   //time to do things one at a time

			 	function(callback) {   									//PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  PROCESS NOT FOUND ***  

		           // tags_not_found.find().toArray(function(err, items) {
		            tags_meta.find().toArray(function(err, items) {

		                if (err) { console.dir(err); }
		                if (items.length === 0) { console.log('Empty here :('); }

		                
		                callback(null, items);

		            });
		        },	        

					 		function(items, callback) {   //LOAD SIMPLE DICTIONARY INTO ARRAY

					 			var total_matched = 0;
					 			var total_missed = 0;
					 			var total_extra = 0;

				                for (i in items) { //display as you go //DISPLAY LAST 5
				                	if(items[i].Matched === undefined) items[i].Matched = 0.001; 
				                	if(items[i].Missed === undefined) items[i].Missed = 0.001; 
				                	if(items[i].Extra === undefined) items[i].Extra = 0.001; 
				                	total_matched = total_matched + items[i].Matched;
				                	total_missed = total_missed + items[i].Missed;
				                	total_extra = total_extra + items[i].Extra;

				                	if(items[i].Missed > above_print){ 				         
				                		items[i].Score = items[i].Matched/items[i].Missed;
				                		items[i].Scoreplusextra = items[i].Matched/(items[i].Extra);
				                		//items[i].Score = items[i].Scoreplusextra;
				                		top_tags.push(items[i]); 
				                	}		

								}

								console.log("TOTAL ACCURACY: " + (total_matched/total_missed));
								console.log("TOTAL ACCURACY PLUS EXTRA: " + (total_matched/(total_extra)) );

								var total_list_length = items.length;

		                 		callback(null, total_list_length, top_tags);

							},

							function(total_list_length, top_tags, callback) {       //PROCESS TEST DATA					

								top_tags.push({Term: "BLANKS", Num: [0]});  //blank end for sorting

								var temp;
						        for(var w = 0; w < top_tags.length-1; w++){
							        var temp;

							        for(var g = 1; g < top_tags.length + 1; g++){
							        	
							        	if(top_tags[g] === undefined){}

							            else if(top_tags[g-1].Scoreplusextra < top_tags[g].Scoreplusextra){

							            	top_tags.splice(g-1,0,top_tags[g]);
							            	top_tags.splice(g+1,1);				            						                		
							            }  
							        }			               
							    }

							    callback(null, total_list_length, top_tags);
							},

							function(total_list_length, top_tags, callback) {       //PROCESS TEST DATA

								var text_out="";	
								var the_results = [];
								//console.log("TEST" + top_tags[2].Tag + top_tags[2].Score);				

								for(var t = 0; t < (top_tags.length - 1); t++){

									if(top_tags[t].Scoreplusextra > 0.1 && top_tags[t].Extra != 0.001){    

										console.log("---------------------------------------------------");      
								        console.log("TAG: " + top_tags[t].Tag);
								        console.log("MATCHED: " + top_tags[t].Matched);
								        console.log("MISSED: " + top_tags[t].Missed);
								        console.log("EXTRA: " + top_tags[t].Extra);
								        console.log("ACCURACY: " + top_tags[t].Score);
								        console.log("ACCURACY VS EXTRA: " + top_tags[t].Scoreplusextra);

								    }

							       // text_out = text_out + '"' +  top_tags[t].Tag + '",';	
							  //     the_results.push( {"Tag" : top_tags[t].Tag, "Num" : top_tags[t].Num, "Match" : 99999} );
								}	
							
					         	callback(null,total_list_length, the_results);

							},
										

					        function(total_list_length, the_results, callback) {       //PROCESS TEST DATA

					        	var current_taglist = [];
					        	var placehold;
					        	var cuttoff = 0.2;
					        	var cuttoffplus = 0.2;
					        	var filtered_list = [];
					        	var forward = false;
					        	


								current_taglist = require('../../Data/top_tag_list_top_10624_sorted_jsvar.js');  //EXTERNAL TAG LIST SORTED AND CUT BY FREQUENCY IN TRAIN DATA
								current_taglist = current_taglist.thetags;

								for(var k = 0; k < current_taglist.length ; k++){

									placehold=0;
									forward=false;
									var temptag;

									for(var j = 0; j < top_tags.length; j++){
										if(current_taglist[k] === top_tags[j].Tag){
											forward=true;
											temptag = top_tags[j];
										
										}

									}


									if(forward === true && temptag.Score > cuttoff && temptag.Scoreplusextra > cuttoffplus && temptag.Extra != 0.001){
																				
										filtered_list.push(current_taglist[k]);
										//console.log(current_taglist[k]);
									
									}
								}


								console.log("Cuttoff: " + cuttoff);
								console.log("Cuttoff plus extra: " + cuttoffplus);
								console.log("OLD SEARCH TAG LIST LENGTH: " + current_taglist.length);
								console.log("SCORED TAGS LIST LENGTH: " + top_tags.length);
								console.log("NEW SEARCH TAG LIST LENGTH: " + filtered_list.length);

					        	
									       		var matched_results = [];
									        	var text_out;
									        	var score_out;



												for(var e = 0; e < filtered_list.length; e++){
									             //   console.log("Scored: " + the_results[e].Tag + " #: " + the_results[e].Score);
									                text_out = text_out + '"' + filtered_list[e] + '",';
									            }     

									            fs.writeFile('../../Data/top_tag_FILTERED_laptop_12_16_1pm.txt', text_out, function(err) {
													if(err) {
													    console.log(err);
													} else {
													    console.log("The file was saved!");
													}
												});



												for(var e = 0; e < top_tags.length; e++){
									             //   console.log("Scored: " + the_results[e].Tag + " #: " + the_results[e].Score);
									                score_out = score_out + '" Tag: ' + top_tags[e].Tag + " Matched: " +  top_tags[e].Matched + " Missed: " +  top_tags[e].Missed + " Extra: " +  top_tags[e].Extra + " Score: " + top_tags[e].Score + " Score + extra: " + top_tags[e].Scoreplusextra + ' ",';
									            }     

									            fs.writeFile('../../Data/top_tag_SCORE_REPORT.txt', score_out, function(err) {
													if(err) {
													    console.log(err);
													} else {
													    console.log("The file was saved!");
													}
												});      

									        //    console.log("Total above limit: " + the_results.length);  										

									 
					        }]);												
				});
	}



     //-----------------------------------------------------------

     function vectortest() {
     	console.log("CHECK VECTOR MAP");
     	var searchtag = process.argv[3];

        train_db.open(function(err, train_db) {

            if (err) { console.dir(err); }

            console.log('Document vector map terms'.yellow.bold);

            vectorcollection.find({Term:searchtag}).toArray(function(err, found_items) {

                if (err) { console.dir(err); }

                if (found_items.length === 0) { console.log('Not found in DB'); }

                console.log("Found in DB (#>1 = dupes): " + found_items.length);
                for (var i = 0; i < found_items.length ; i++) { //display as you go //DISPLAY LAST 5

					console.log('- - - - - - - - - - - - - - - -');
					//console.log(items[i].title.bold);	
					console.log(found_items[i]);   						
                }  
                console.log("Found in DB (#>1 = dupes): " + found_items.length);

            });
        });
    } 	

        //-----------------------------------------------------------
    
	function natural() {
		console.log(tokenizer.tokenize("your dog has flees."));



	/*	//STRIP HTML
		var html = '<style>b {color: red;}</style>' +
		                         ' Yey, <b> No more, tags</b>' +
		                         '<script>document.write("Hello from Javascript")</script>';
		var options = {
		        include_script : false,
		        include_style : false,
		        compact_whitespace : true
		    };

		    // Strip tags and decode HTML entities
		var text = html_strip.html_strip(html,options);
		console.log(text)
		*/
        train_db.open(function(err, train_db) {

            if (err) { console.dir(err); }

            vectorcollection.find().toArray(function(err, vectors) {  //query our entire dictionary collection

                if (err) { console.dir(err); }

                natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
				    console.log(classifier.classify('long SUNW'));
				    console.log(classifier.classify('short SUNW'));
				});


                vectors.forEach(function(vector) {    //loop through our dictionary of tag objects

                	var counter = 0;

                	vector.docs.forEach(function(doc_id) {	//loop through docs refenced in tag vector

                		collection.find({Id: doc_id}).toArray(function(err, the_doc) {   //find the doc so we can get body/title text

                			classifier.addDocument(the_doc.Body, a_tag);   //add document text to classier and associate it with tag
			
							setTimeout(function() {	counter++}, 200);												

						});
					});

					if(counter === vector.docs.length) classifier.train();  //train tag specific classifier once we've loaded all associated docs

                });

            });

       

        });  

    } 

    //-----------------------------------------------------------
    
		function vectorpurge() {

        train_db.open(function(err, train_db) {


            if (err) { console.dir(err); }

            vectorcollection.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

				items.forEach(function(item) {
				
					    vectorcollection.remove( item, function(err, doc) {});
				                						
				});
               
				console.log('ALL DATA REMOVED FROM VECTOR MAP COLLECTION');
                setTimeout(function() { train_db.close(); }, 2000); 

            });

        });

    } 

      //-----------------------------------------------------------
    
		function reportpurge() {

        train_db.open(function(err, train_db) {


            if (err) { console.dir(err); }

            tags_extra.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

				items.forEach(function(item) {
				
					    tags_extra.remove( item, function(err, doc) {});
				                						
				});
               
			//	console.log('ALL DATA REMOVED FROM VALIDATION TEST COLLECTIONS');
            //    setTimeout(function() { train_db.close(); }, 2000); 

            });

            tags_not_found.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

				items.forEach(function(item) {
				
					    tags_not_found.remove( item, function(err, doc) {});
				                						
				});
               
			//	console.log('ALL DATA REMOVED FROM VALIDATION TEST COLLECTIONS');
              //  setTimeout(function() { train_db.close(); }, 2000); 

            });

            tags_matched.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

				items.forEach(function(item) {
				
					    tags_matched.remove( item, function(err, doc) {});
				                						
				});
               
				console.log('ALL DATA REMOVED FROM VALIDATION TEST COLLECTIONS');
                setTimeout(function() { train_db.close(); }, 2000); 

            });

            tags_meta.find().toArray(function(err, items) {

                if (err) { console.dir(err); }

				items.forEach(function(item) {
				
					    tags_matched.remove( item, function(err, doc) {});
				                						
				});
               
				console.log('ALL DATA REMOVED FROM VALIDATION TEST COLLECTIONS');
                setTimeout(function() { train_db.close(); }, 2000); 

            });

        });

    } 


    //-----------------------------------------------------------


	function hardpurge() {

         train_db.open(function(err, db) {

            if (err) { console.dir(err); }

            report.remove( function(err, doc) {

                console.log("ALL DATA REMOVED FROM COLLECTION");
            //    db.close();
				
				vectorcollection.remove( function(err, doc) {

					console.log("ALL DATA REMOVED FROM TREFERENCE");

						 train_db.close();
				});
            });		
	//	db.close();
        });
    }


    //-----------------------------------------------------------


	function dbopen() {

        db.open(function(err, db) {

            if (err) { console.dir(err); }

        });
		
		console.log('DATABASE OPENED');

    }
	
	function dbclose() {

		db.close();
		console.log('DATABASE CLOSED');
    }


	//-----------------------------------------------------------
	
    function help() {
        console.log('CSV to Mongo and preprocessing');
        console.log('Usage:');
		console.log('$ --genclassifiers  // generate naive bayes classifiers for top 30 tags');
		console.log('$ --validate  // test classifiers against training set');
        console.log('$ --trainlist  // review data');
        console.log('$ --vectorlist  // review vector map');
        console.log('$ --vectortest <search term>  // lookup tags in dictionary');
        console.log('$ --vectorpurge  // empty vector map collection');
        console.log('$ --reportlist  // review report collection for algo testing');
        console.log('$ --metareportlist  // review report collection for algo testing');
        console.log('$ --reportpurge  // empty report collection');
        console.log('$ --natural  // npm natural test function');
        console.log('$ --hardpurge  // hard collection removal');
        console.log('$ --help  // command menu');
		console.log('spool site options: "indeed", "cl", "gov", "monster"');
        console.log('Conan, what is best in life? To crush your enemies, see them driven before you, and hear the lamentations of the women!'.rainbow);
    }

    return {
        vectortest: vectortest,
        vectorlist: vectorlist,
        validate: validate,
        genclassifiers: genclassifiers,
		reportlist: reportlist,
		metareportlist: metareportlist,
		reportpurge: reportpurge,
		natural: natural,
		vectorpurge: vectorpurge,
		hardpurge: hardpurge,
        help: help
    };

    function stopword(the_word){
    	stopwords=["a","able","about","above","abroad","according","accordingly","across","actually","adj","after","afterwards","again","against","ago","ahead","aint","all","allow","allows","almost","alone","along","alongside","already","also","although","always","am","amid","amidst","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","arent","around","as","as","aside","ask","asking","associated","at","available","away","awfully","b","back","backward","backwards","be","became","because","become","becomes","becoming","been","before","beforehand","begin","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","came","can","cannot","cant","cant","caption","cause","causes","certain","certainly","changes","clearly","cmon","co","co.","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldnt","course","cs","currently","d","dare","darent","definitely","described","despite","did","didnt","different","directly","do","does","doesnt","doing","done","dont","down","downwards","during","e","each","edu","eg","eight","eighty","either","else","elsewhere","end","ending","enough","entirely","especially","et","etc","even","ever","evermore","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","fairly","far","farther","few","fewer","fifth","first","five","followed","following","follows","for","forever","former","formerly","forth","forward","found","four","from","further","furthermore","g","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","h","had","hadnt","half","happens","hardly","has","hasnt","have","havent","having","he","hed","hell","hello","help","hence","her","here","hereafter","hereby","herein","heres","hereupon","hers","herself","hes","hi","him","himself","his","hither","hopefully","how","howbeit","however","hundred","i","id","ie","if","ignored","ill","im","immediate","in","inasmuch","inc","inc.","indeed","indicate","indicated","indicates","inner","inside","insofar","instead","into","inward","is","isnt","it","itd","itll","its","its","itself","ive","j","just","k","keep","keeps","kept","know","known","knows","l","last","lately","later","latter","latterly","least","less","lest","let","lets","like","liked","likely","likewise","little","look","looking","looks","low","lower","ltd","m","made","mainly","make","makes","many","may","maybe","maynt","me","mean","meantime","meanwhile","merely","might","mightnt","mine","minus","miss","more","moreover","most","mostly","mr","mrs","much","must","mustnt","my","myself","n","name","namely","nd","near","nearly","necessary","need","neednt","needs","neither","never","neverf","neverless","nevertheless","new","next","nine","ninety","no","nobody","non","none","nonetheless","noone","no-one","nor","normally","not","nothing","notwithstanding","novel","now","nowhere","o","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","ones","only","onto","opposite","or","other","others","otherwise","ought","oughtnt","our","ours","ourselves","out","outside","over","overall","own","p","particular","particularly","past","per","perhaps","placed","please","plus","possible","presumably","probably","provided","provides","q","que","quite","qv","rather","rd","re","really","reasonably","recent","recently","regarding","regardless","regards","relatively","respectively","right","round","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","shant","she","shed","shell","shes","should","shouldnt","since","six","so","some","somebody","someday","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","t","take","taken","taking","tell","tends","th","than","thank","thanks","thanx","that","thatll","thats","thats","thatve","the","their","theirs","them","themselves","then","thence","there","thereafter","thereby","thered","therefore","therein","therell","therere","theres","theres","thereupon","thereve","these","they","theyd","theyll","theyre","theyve","thing","things","think","third","thirty","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","till","to","together","too","took","toward","towards","tried","tries","truly","try","trying","ts","twice","two","u","un","under","underneath","undoing","unfortunately","unless","unlike","unlikely","until","unto","up","upon","upwards","us","use","used","useful","uses","using","usually","v","value","various","versus","very","via","viz","vs","w","want","wants","was","wasnt","way","we","wed","welcome","well","well","went","were","were","werent","weve","what","whatever","whatll","whats","whatve","when","whence","whenever","where","whereafter","whereas","whereby","wherein","wheres","whereupon","wherever","whether","which","whichever","while","whilst","whither","who","whod","whoever","whole","wholl","whom","whomever","whos","whose","why","will","willing","wish","with","within","without","wonder","wont","would","wouldnt","x","y","yes","yet","you","youd","youll","your","youre","yours","yourself","yourselves","youve","z","zero","XX", "salary", "job", "A", "jobs","cover","letter","contact","tool","role","person","apply","salary","history","requirements","education","history","ability","skill","proficiency","work","road","street","place","suite","room","time","skills","performance","experience","representation","excellent","time","relationship","somebody","participate","participation","quality","responsible","responsibilities","qualify","qualifications","capacity","country","issue","issues","order","user","position","equivalent","knowledge","supports","candidates","duties","duty","include","facility","candidate","summary","people","familiar","familiarity","request","requests","primary","secondary","employee","employees","employ","employer","employment","relationship","relationships","one","two","three","four","five","six","seven","eight","nine","ten","preferred","compensation","compensate","functions","function","year","years","month","months","day","days","commitment","willingness","application","follow","values","growth","belief","culture","require","required","mission","program","programs","substantial","organization","description","information","background","backgrounds","company","companys","initiative","questions","question","answer","answers","follow","following","interview","interviews","posses","report","reports","right","left","everyone","decision","decisions","benefit","benefits","presence","opportunity","thousand","million","word","interest","talent","talented","talents","today","todays","countries","identity","level","value","sense","task","tasks","location","ideal","must","date","standard","standards","detail","details","emphasis","basis","hours","communication","orientation","management","materials","flexibility","opportunities","responsibility","office","print","you'll","applicants","applicant","attention","services","status","expertise","activity","activities","characteristics","expenses","title","applications","professionals","professional","service","department","aptitude","minute","result","email","emails","availability","employers","offices","expense","first","other","valid","type","both","base","setup","area","needed","need","support","qualities","staff","others","none","term","decisiveness","consideration","group","groups","world","personal","personnel","dedication","individual","individuals","supplies","conduct","competency","teamwork","positions","facilities","integrity","change","excellence","productivity","difficulty","relations","relation","state","action","projects","open","strong","direction","high","face","were","such","idea","ideas","thats","at","dont","stuff","things","well","will","trust","nice","mind","care","have","youd","pair","part","wage","terms","areas","focus","point","works","asset","items","professionalism","functionality","including","volume","diligence","integral","openings","desire","basic","arent","share","array","meets","essential","equal","quality","identification","full","flow","sites","final","sets","side","reference","whom","when","number","discipline","capabilities","appropriate","life","line","member","extent","career","concepts","purpose","conditions","objectives","additional","satisfaction","NOTE","online","qualification","selection","preference","vacation","abilities","processes","resource","numbers","human","below","character","center","resume","which","more","proof","item","multiple","eligibility","operations","submission","includes","view","form","page","career","minimum","more","red","yellow","blue","orange","black","white","titles","salary","worker","basis","click","unit","above","new","behavior","products","past","someone","check","offer","short","use","visit","over","hour","selfstarter","insight","religion","priority","monday","tuesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december","second","changes","sample","enter","sames","links","control","period","dates","large","north","shift","event","link","lots","XX", "anticipation", "season", "business", "relationship", "com", " ", "peak", "dispute", "order", "perseverance", "vibrance", "WWW", "revenue", "sale", "city", "NY", "advisory","strategy","major","processe","proposal","requisition","master","data","article","agency","analytic","enablement","salary","0","12:00 PM","00 p m","00 telecommute option","00 vacancy","000 discou","000 employees","000 employees bp","000 people","000 stores","1a","a","abilities","abilities ability","abilities knowledge","abilities ksas","ability","ability ability","able","about","above","absence","abst","acceptance","access","accident","accommodation","accommodations","accomplishment","accomplishments","accordance","according","accordingly","accountabilities","accountability","accreditation","accredited","accredited institution","accredited school","accredited university","accuracy","achievement","achievements","acquisition","across","act","action","action employer","action employer m f","action employer m f v","action plans","actions","activities","activities customers","activity","activity requirements","actually","acuity","acumen","adaptability","added","addition","additional","address","address issues","addresses","adequacy","adherence","adj","adjustments","admission","adoption","adult","adults","advanc e","advance","advancement","advancement opportunities","advances","advantage","advice","advocate","af dcips employees","affairs","affected","affecting","affects","after","afterwards","again","against","age","age groups","age sex","agencies","agility","ago","agreement","agreements","ah","aids","alabama","albuquerque","alignment","all","allocation","almost","alone","along","already","also","alternative","alternative format","alternatives","although","always","am","america","american","americans","america's","among","amongst","amoungst","amount","amounts","amp","an","analysis","and","announce","announcement","annuitants applicants","annuitants click","another","answer","answer questions","answers","answers button","antonio","any","anybody","anyhow","anymore","anyone","anything","anyway","anyways","anywhere","apparently","appearance","applicant","applicant pool","applicants","application","application materials","application process","application questionnaire","application status","applications","apply","apply'","appointments","appreciation","approach","approaches","appropriate","appropriateness","approval","approvals","approximately","april","aptitude","are","area","areas","aren","arent","arise","arizona","arm","around","arrangements","array","as","asap","aside","ask","asked","asking","asks","asp","aspect","aspects","assemblies","assessment","assessment questionnaire","assessments","asset","assets","assignment","assignments","assistance","associates","association","assortment","assumptions","assurance","at","atlanta","attainment","attendance","attention","attitude","attributes","audience","audiences","august","austin","auth","authorities","authority","authorization","availability","available","award","awards","awareness","away","awfully","az","b","back","backed","background","background check","background checks","background investigation","backgrounds","backing","backs","baltimore","bar","barriers","base","base salary","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","beginning","beginnings","begins","behalf","behavior","behind","being","beings","belief","beliefs","believe","below","benefit","benefit package","benefits","benefits package","beside","besides","best","better","between","beyond","big","bill","billion","billion fortune","biol","bit","black","block","blue","board","bodies","body","bonus","bonuses","both","bottom","boundaries","box","bp group","branch","branch performance","breadth","brief","briefly","broadband communications consumer devices healthcare","bsn","buffalo","business","business days","business hours","business partners","business relationships","business waterworks job type","but","button","by","c","c c","ca","calendar","calendar days","california","call","came","campus site","can","canada","candidate","candidates","cannot","cant","can't","capabilities","capability","capacities","capacity","capital","card","cardboard","care","care st vincent","career","career move we're","career opportunities","career opportunity","career path","careerbuilder","careers","carolina","carrier position","cart","carts","case","case basis","caseload","cases","cash fund","categories","category","cause","causes","cdl","center","centers","century","certain","certainly","certificate","certification","certifications","cf industries","cfr","chain","challenge","challenges","chance","change","changes","channels","character","characteristics","charge","charges","charlotte","check","chicago","choice","circumstances","cities","citizen","citizenship","city","clarification","clarity","class","classes","classification","cleanliness","clear","clearly","click","'click","client","client relationships","client requirements","clients","close","closure","co","co workers","coast","code","codes","collaboration","colleagues","colleague's","collection","collections","college","college degree","columbia","com","combination","come","comes","comfort","comfort level","command","comments","commission","commitment","commitments","committee","commonwealth","communicates","communication","communication skills","communication skills ability","communication skills both","communication skills experience","communicator","communities","community","companies","company","company description","company guidelines","company policies","company policy","company security practices","company standards","companys","company's","compensate","compensation","compensation package","compensation packages","competence","competencies","competency","competition","completeness","completion","complexity","compliance","composure","con","concentration","concept","concepts","concerns","conclusion","conclusions","condition","conditions","conduct","confidence","configure","conflict","conformance","conjunction","connection","connections","consideration","considerations","consistency","constraints","consultant","consultants","contact","contact information","contacts","contain","containing","contains","content","contents","context","continuity","continuum","contractors","contribution","contributions","contributor","control","controls","conversation","conversations","conversion","cooperation","coordinates","coordination","copies","copy","core","core competencies","core values","corp","correction","corrections","correspondence","correspondence ability","cost","could","couldnt","council","countertop plan","counties","countries","countries invista","country","country's","county","course","course work","courtesy","cover","cover letter","cover page","coverage","coworkers","creation","creativity","credentials","credibility","criteria","cross","crouch","crowd","crumbs","cry","culture","curriculum","curriculum vitae","customer","customer requirements","customer service leadership","customers","customer's","customers ability","cv","cycle","d","dallas","damage","date","date applicants","dates","day","days","dc","de","deadline","deadlines","deadlines ability","deal","december","decision","decision makers","decisions","decisiveness","dedication","defense te connectivity","deficiencies","definition","degree","degree level","degrees","delivery","demand","demands","demeanor","demonstration","denver","department","department policies","departments","deployment","deposit","depth","depth experience","depth knowledge","describe","description","description job summary","desire","desk","destination","detail","detail ability","details","determination","dev panda","development","developments","dice","did","didn't","differ","difference","differences","different","differently","difficulties","difficulty","dignity","diligence","diploma","direction","directions","directives","disabilities","disabilities act","disability","disability persons","discharge","discipline","disciplines","discounts","discovery","discrepancies","discretion","discrimination","discussions","display","displays","disposal","disposition","disqualification","dissemination","distance","distribution","district","diversity","division","divisions","do","documentation","documents","documents section","dod","dod policy","does","doesn't","doing","done","dont","don't","doors","down","downed","downing","downs","downwards","draft","drawer","drive","drives","drop shipment categories","drug","drug screen","drug test","drug use","drugs","due","duluth","duration","during","duties","duties amp responsibilities","duties responsibilities","duty","duty service","e","e mail","each","early","ecc","ed","edge","edu","education","education bachelor","education credentials","education degree","education education","education experience","education experience skills","education program","education requirement","education requirements","eeo","eeo aa employer m f","effect","effectiveness","effects","efficiencies","efficiency","effort","efforts","eg","eight","eighty","either","element","elements","eleven","eligibilities","eligibility","eligibility documentation sf","eligibility qualifications","eligibility requirements","else","elsewhere","email","email notification","email subject line","emails","emergency","emphasis","employ","employee","employee encounters","employee handbook","employees","employer","employer job code","employers","employment","employment authorization","employment eligibility","employment i e hours","employment opportunities","employment opportunity","employment relationship","empty","end","ended","ending","ends","enforcement","engagement","engagements","engages","english","english both","english language","enhancement","enhancements","enough","enrollment","enter","enterprises","enthusiasm","entities","entries","entry","environment","environments","eoe","equal","equivalent","equivalent ability","equivalent combination","equivalent education","equivalent experience","equivalent work experience","errors","escalation","especially","essential","establishment","estimates","et","et-al","etc","ethics","evaluation","evaluation criteria","evaluations","even","evenings","evenings weekends","evenly","event","events","ever","every","everybody","everyone","everything","everywhere","evidence","evolution","ex","examination","example","examples","excellence","excellent","except","exception","exceptions","exchange","execution","exercise","exercise selection priority","exhibit","expansion","expectation","expectations","expense","expenses","experience","experience applicants","experience click","experience credit","experience education","experience equivalent","experience experience","experience knowledge","experience one","experience qualifications","experience requirements","experiences","expert","expert knowledge","expertise","exposure","expression","ext","extension","extent","extremities","f","face","faces","facets","facilities","facility","fact","factor","factors","facts","failure","faith","fall","familiar","familiarity","families","far","fax","fax number","fax transmission","fda","feasibility","features","february","fee","feedback","fees","fellow employees","felt","few","ff","field","fields","fifteen","fifth","fify","figures","fill","final","find","findings","finds","finger","fingers","fire","firm","first","first day","first year","five","five years","five years experience","fix","fl","flexibility","florida","flow","fluency","focus","follow","followed","following","follows","for","force","forefront","form","former","formerly","fort","forth","fortune","forty","found","foundation","four","four digits","four year college","four years","freedom","frequency","fri","friday","friend","friends","from","front","fryer","fulfillment","full","fully","fumes","fun","function","functionality","functions","fundamentals","further","furthered","furthering","furthermore","furthers","future","fx","g","g e","ga","gain","gainesville","galleria","gaps","gave","general","generally","generation","geography","georgia","get","gets","getting","give","given","gives","giving","globe","go","goal","goals","goes","going","gone","good","goods","got","gotten","gpa","grade","grade level","graduate","graduates","graduation","gram implementation","great","greater","greatest","greensboro","ground","grounds","group","grouped","grouping","groups","growth","growth opportunities","growth opportunity","gt","guest","guidance","guide","guidelines","h","had","hand","hands","happens","hardly","has","hasnt","hasn't","have","haven't","having","hazards","he","health care reimbursement","healthcare provider","hed","hence","her","here","hereafter","hereby","herein","heres","hereupon","heritage","hers","herself","hes","hi","hid","high","higher","highest","hills","him","himself","his","history","hither","holiday","holidays","home","home office","honesty","hope","hour","hour shifts","hours","hours day","houston","how","howbeit","however","hr","hrs","human","hundred","hundreds","hz","i","i e","icd","id","idea","ideal","ideas","identification","identity","ie","if","ii","i'll","illinois","im","image","immediate","immediately","impact","impacts","implementation","implements","implications","importance","important","improvement","improvements","in","inc","incentives","inception","incidents","include","includes","including","inclusion","increase","incumbents","indeed","independence","index","individual","individuals","industries","industry","industry experience","industry leader","industry's","influence","information","information ability","information click","initiation","initiative","initiatives","innovation","innovations","input","inquiries","insight","insights","inspection","installation","instead","institute","institutes","institution","institutions","instruction","instructions","integral","integral part","integrity","intent","interaction","interactions","interest","interested","interesting","interests","interfaces","interpretation","interruptions","intervention","interventions","interview","interview process","interviews","into","introduction","invention","investigation","involvement","inward","is","isn't","issuance","issue","issues","it","itd","item","items","it'll","its","it's","itself","i've","j","j m smucker company","jacksonville","january","jersey","job","job announcement","job applicants","job block","job block view","job description","job descriptions","job details","job duties","job experience","job function","job functions","job id","job knowledge","job number","job offer","job qualifications","job qualifications completion","job requirements","job requirements page","job requirements page ability","job responsibilities","job summary","job title","jobs","judgment","july","jun","june","just","k","k n owl e dge","k plan","k retirement plan","kansas","keep","keeps","kept","kg","kind","kinds","km","knew","know","knowledge","knowledge experience","knowledge skill","knowledge skills","knowledge skills abilities","knowledge skills amp abilities","known","knows","ky","l","l e m pl oym e nt","large","largely","las","last","lately","later","latest","latitude","latter","latterly","lbs","lead","lead capacity","leader","leaders","leadership","learner","learners","least","left","length","less","lessons","lest","let","lets","letter","letters","level","level experience","levels","leverage","leverages","liaison","license","lieu","life","lifestyle","lights","like","liked","likely","limit","limitations","limits","linde group","line","lines","link","links","list","list air force employee","lists","little","lives","'ll","llc","location","locations","log","long","longer","longest","look","looking","looks","losses duties","lot","lots","louis","love","ltd","m","made","mainly","maintenance","majority","make","makes","making","man","manageability","management","manhattan","manner","manner ability","manuals","many","march","masters degree","material","materials","matter","matters","may","maybe","md","me","meals","mean","means","meantime","meanwhile","measure","medium","meetings","meets","member","members","membership","memphis","men","menu","merchandise order zones","merchandise presentation guidance work experience","merely","message","messages","method","methodology","methods","mexico","mg","mh","mi","michigan","middle","midnight","might","miles","milestones","mill","million","million people","millions","milwaukee","mind","mine","minimum","minneapolis","minnesota","minorities","minute","minutes","miss","mission","mission statement","missouri","mix","ml","mn","mo","modification","modifications","modules","monday","monies","monitors","monster","month","month contract","month end","month year","months","months basis","months experience","more","moreover","mos afsc","most","mostly","motivation","move","movement","mr","mrs","much","mug","multi","multiple","multitask","murray","must","my","myself","n","na","name","name address phone number","namely","names","nation","nation's","nature","nay","nd","near","nearly","necessarily","necessary","need","needed","needing","needs","neither","networks","never","nevertheless","new","newer","newest","next","nice","night","nights","nights weekends","nine","ninety","nj","no","nobody","noise","non","none","nonetheless","noone","nor","normally","north","nos","not","NOTE","noted","notes","nothing","notice","notification","november","now","nowhere","ns t rat e","number","number one","number sequence","numbers","nurse rn","nv","ny","o","object","objections","objective","objectives","objects","observations","obstacles","obtain","obtained","obviously","occasion","october","of","off","offenders","offer","offerings","office","office environment","office procedures","offices","official","often","oh","ohio","ok","okay","oklahoma","old","older","oldest","omissions","omitted","on","once","one","one copy","one hour","one nineteen home health care","one time","one year","one year experience","one year probationary period","ones","online","only","onsite","onto","open","opened","opening","openings","opens","operation","operations","operations core competencies","opm form","opportunities","opportunity","opportunity employer","opportunity employer applicants","opportunity employer drug","opportunity employer eoe","opportunity employer m f","opportunity employer segment","opportunity employers","option","options","or","orange","ord","order","ordered","ordering","orders","org","organization","organization ability","organization eoe aa m f","organization skills","organizations","orientation","orientation ancestry","orientation gender identity","origin","origin age","origin age disability","origin disability","other","others","others ability","otherwise","ought","our","ours","ourselves","out","outcome","outcomes","output","outreach","outside","oven grill deef","over","overall","oversight","overtime","overview","overview benefits","owing","own","owner","ownership","p","p m","pace","packages","page","pages","pair","paper","parameters","parents","part","parted","participant","participants","participate","participation","particles","particular","particularly","parting","partner","partners","partnership","partnerships","parts","past","paste","path","patience","patient","patient care","patients","patterns","payment","payments","pdf","peers","pennsylvania","people","per","percent","percentages knowledge","performance","performance reviews","performance standards","perhaps","period","periods","perks","permission","person","personal","personality","personnel","persons","person's strengths","perspective","perspectives","ph","phase","phases","philadelphia","philosophy","phoenix","phone","phones","picture","pieces","pipeline","pittsburgh","place","placed","placement","places","plan","plans","plant","platform","platforms","please","plenty","plus","pm","point","pointed","pointing","points","policies","policies procedures","policy","pool","poorly","portion","portions","position","position applicants","position click","position comments","position description","position email","position end date level","position experience","position requirements","position responsibilities","position summary","position type","position works","positions","positions subject","posses","possession","possibilities","possibility","possible","possibly","post","post offer pre placement drug test","potentially","pounds","pounds ability","power","pp","practice","practices","practices ability","pre","pre employment","pre employment drug","pre employment substance abuse","pre employment tests","pre placement verification","predominantly","preference","preferences","preferred","premier","preparation","presence","present","presented","presenting","presents","pressure","preview questions","previously","pride","primarily","primary","principles","print","priorities","prioritization","prioritize","priority","privacy","prn","proactive","probably","problem","problems","problems ability","procedure manuals ability","procedures","procedures ability","process","process improvements","processes","product lines","production environments","productivity","products","professional","professionalism","professionals","proficiency","profile","profit","profit organization","program","program requirements","programs","progress","project","project status","project team members","projects","promise","promotion","promotions","promptly","proof","properties","prospects","proud","provider","provides","provision","provisions","pto","publications","punctual","punctuation","purpose","purposes","pursuit","put","puts","putting","q","qualification","qualification determinations","qualification requirements","qualifications","qualifications ability","qualifications determinations","qualifications education","qualifications experience","qualifications knowledge","qualifications one","qualifications requirements","qualify","qualities","quality","quality assurance","quality issues","quality results","quality service","quality services","quality solutions","quality standards","quality work","quantities","quantity","que","question","questionnaire","questionnaire responses","questionnaire view","questions","quickfind","quickly","quite","qv","r","r amp","r ce","r g","r l schedule","r sum","race color","race color religion","race color religion gender","race color religion sex","ran","range","ranges","rank dates","rapport","rate","rates","rather","rd","re","re t","readily","readiness","reality","really","reason","reasons","recent","recently","recognition","recommendation","recommendations","reconciliation","record","records","recovery","red","ref","reference","references","referrals","refs","regard","regarding","regardless","regards","region","regions","registration","regulations","reinstatement rights","related","relation","relations","relationship","relationships","relatively","release","reliability","religion","relocation","relocation assistance","relocation expenses","relocation package","removal","removal date","replacement","report","reports","representation","representative","reputation","request","requests","require","required","requirement","requirements","requirements ability","requisition id","requisition number","research","residence","residency","residents","resilience","resolution","resource","resources","resources department","respect","respectively","response","responses","responsibilities","responsibilities duties","responsibility","responsible","rest","restrictions","restroom","result","resulted","resulting","results","resume","retention","retention incentives","retirement plan","retirement separation","return","review","reviews","reviews dollar general's","reviews intermountain healthcare","reviews jpmorgan chase","revisions","reward","rewards","right","right candidate","right people","rights","rise","risk","rn","rn license","road","roadmap","role","role model","roles","roll","room","rooms","root cause","rotation","rounds","route","rules","run","s","safety","safety regulations","safety rules","said","saint","salaries","salary range","salary requirements","sales assoc ft","same","sames","sample","san","san francisco","satisfaction","saturday","saw","say","saying","says","scale","schedule","schedule type","schedules","school degree","school diploma","school graduate","school graduation","school level","scope","score","scratch","screen","screens","search","seattle","sec","second","secondary","seconds","section","sections","sector","secure","securities","security number","security policies","see","seeing","seem","seemed","seeming","seems","seen","sees","selection","selection priority","selection process","selection process applicants","selection process bp","self","self starter","selfstarter","selves","semi","sense","sensitivity","sent","sentences","september","sequence","series","serious","service","service career career","service i e","services","services firm","services multi specialty clini","services schedule","sessions","sets","settings","setup","seven","seven years","several","sf","shall","shape","share","she","shed","she'll","shes","shield","shift","shift day job employee status","shift details","shift work","shifts","short","should","shoulder","shouldn't","show","show proof","showed","showing","shown","showns","shows","si organization inc","side","sides","sign","signature","signatures","significant","significantly","silver spoon","similar","similarly","since","sincere","site","sites","situation","situations","six","six continents","six months","six years","sixty","size","skill","skill level","skill sets","skills","skills ability","skills attention","skills experience","skills knowledge","skills proficiency","slightly","small","smaller","smallest","smile","so","society","solution","solutions","some","somebody","somehow","someone","somethan","something","sometime","sometimes","somewhat","somewhere","sonoma county","soon","sorry","sound decisions","source","sources","space","spaces","specialization","specialties","specialty","specialty area","specifically","specifications","specified","specify","specifying","spectrum","spirit","sponsorship","springs","sr","st re n g","stability","staff","staff meetings","staff members","stage","stages","stakeholders","stand","standard","standardization","standards","start","state","statement","statements","states","station","status","status reports","step","steps","still","stipend","stock availability","stocker","stop","stories","strategies","street","strength","strengths","stress","strong","strongly","structure","structures","study","stuff","style","styles","sub","subject","subject matter","subject matter expertise","subject matter experts","submission","submissions","submit","subordinates","subsidiaries","subsidiary","substances","substantial","substantially","substitute","success","successfully","such","sufficiently","suggest","suggestions","suitability","suite","summary","summer","sunday","sup","supervision","supervision ability","supervisor","supervisors","supervisors management staff","supplies","support","supports","sure","surfaces","system","systems","systems experience","t","table","tables","take","taken","taking","talent","talented","talents","target","task","tasks","tasks ability","tasks responsibilities","tdd","team","team ability","team atmosphere","team environment","team environment ability","team member","team members","team player","team work","teams","teamwork","technique","techniques","techniques ability","technologies","technology","telephone","tell","ten","ten years","tends","term","term disability","term positions","term relationships","terminal","termination","terminology","terms","territories","territory","test","test plans","texas","th","than","thank","thanks","thanx","that","that'll","thats","that's","that've","the","their","theirs","them","themselves","then","thence","theory","there","thereafter","thereby","thered","therefore","therein","there'll","thereof","therere","theres","thereto","thereupon","there've","these","they","theyd","they'll","theyre","they've","thickv","thin","thing","things","think","thinker","thinks","third","this","those","thou","though","thoughh","thought","thoughts","thousand","thousands","three","three core competencies","three core values integrity first service","three months","three references","three years","three years experience","throug","through","throughout","thru","thursday","thursday june","thus","til","till","time","time ability","time basis","time constraints","time employees","time experience","time frame","time job","time job type","time management","time part time","time position","time term","time travel","timeframes","timelines","timeliness","times","timestamp","tip","title","titles","tn","to","today","todays","together","tons","too","took","tool","tools","top","topics","totes stock merchandise","touch","toward","towards","track record","tradition","trainings","transactions","transcript","transcripts","transfer","transfers","transformation","transition","transport","travel","travel arrangements","travel percentage none relocation","treatment","tried","tries","trillion","trouble","truly","trust","try","trying","ts","tuesday","tuition reimbursement","turn","turned","turning","turns","twelve","twenty","twice","twist","two","two weeks","two years","two years experience","tx","type","types","u","un","under","unfortunately","unit","units","university","unless","unlike","unlikely","until","unto","up","updates","upload","upon","ups","urgency","us","usa","usage","usajobs account","use","use cases","use hands","used","useful","usefully","usefulness","user","users","uses","using","usually","utilities","utilization","v","v drug","v intermountain healthcare","v kpmg","va","vacancies","vacancy","vacancy announcement","vacancy id","vacation","vacation time","vacations","valid","validation","validity","valley","value","values","variables","variances","variety","various","vc","'ve","vegas","vendors","verification","verifies","version","very","veteran status","veteran status jobserve usa","veterans' preference","via","view","vigilance","violations","virginia","visa status","visibility","vision","vision abilities","vision benefits","vision coverage","vision depth perception","vision distance vision color vision","vision insurance","vision life","vision life insurance","vision orbits","visit","visits","viz","vol","vols","volume","volunteers","vp","vs","vta","w","wa","wage","wages","want","wanted","wanting","wants","was","washington","washington state department","wasn't","waste","water","waterworks requisition","way","ways","we","weather","web site","wed","week","weekend","weekend hours","weekend work","weekends","weeks","weight","weights","welcome","well","we'll","wells","went","were","we're","weren't","werks","west","we've","what","whatever","what'll","whats","what's","when","whence","whenever","where","whereafter","whereas","whereby","wherein","wheres","whereupon","wherever","whether","which","while","whim","white","whither","who","whod","whoever","whole","who'll","whom","whomever","whos","whose","why","wi","widely","will","willing","willingness","wisconsin","wish","with","within","without","won't","word","words","work","work activities","work area","work areas","work assignment","work assignments","work authorization","work both","work day","work environment","work environments","work ethic","work experience","work experience section","work force","work habits","work history","work hours","work life balance","work mosaic","work orders","work overtime","work place","work practices","work schedule","work schedules","work stations","work tasks","work weekends","workday","worked","worker","workers","workflow","workforce","working","workload","workplace","works","world","world class","world leader","world's","would","wouldn't","wv","www","www stvhs com careers asp careers","x","y","year","year college degree","year degree","year experience","year history today parent kpmg","years","years experience","years' experience","years hands","years sales experience","years work experience","yellow","yes","yet","york","york city","you","youd","you'll","young","younger","youngest","your","youre","you're","yours","yourself","yourselves","you've","yr","yrs","yrs experience","z","zero"];

    		if(stopwords.indexOf(the_word) === -1) return false;
    		else return true;

    } //"I","But", "Any", "Is", "Here", "don", "It", "Are", "Even"

    function tagstop(the_tag){
    	stop_tags = ["this","each", "response","headers","invoke","exceptions","policy","ignore","comma","explode","services","join", "background","loop","numbers","retrieve","pair","updating","less","client","color","row","settings","services","automatic","configure","updates","shapes","access","legal","invalid","area","field","use","returning","search", "email","public","having","information","string","comparison","format","compare","focus","invite","finally","shape","sleep","volume","any","messages","partial","calling","reading","top","common","temporary","summary","command","memory","edit","large","result","convert", "text", "performance", "import", "share", "get", "select", "limit", "replace", "list", "exit", "file", "make", "error", "run", "user", "class", "clear","definition","reduce","add","switch","service", "function","form","like","can", "code", "build", "click", "final","time","single","length","rout", "move", "size", "process", "action", "image","value","set","key","call","between","trace", "view","spacing","sum","find","issues","screen","business","contains","copy","bit","order","properties","go","cheap","var","title", "folder", "object", "date", "point","return","display","passing","short","fields","plan","output","request","data","multiple","remove","sharing","main","where","procedures","center","massive","whenever","change","visible","setup","wait","handle","language","page","pass","strip","line","passing","word","testing","static","exception","update","select","methods","free","hidden","files","resources","example","group","page","testing","install","tasks","users","else","core","back","types","advice","space","difference","accept","generating","out","so","special","enter","basic","watch","which","values","pick","records","system","tools","reference","calls","message","open","option","options","links","columns","place","count","column","content","1996","1997","1998","1999","2000", "2001","2002","2003","2004", "2005","2006", "2007", "2008","2009", "2010","2011", "2012", "2013","2014", "2015","lines","load","context","required","start","send","type","equals","product","events","creation","task","put","results","case","behavior","path","checked","out","instance","x","name","version","exists","defined","effects","post","generate","light","frame","project","apply","record","except","through","playing","work","gets","big","disable","pages","how-to","input","feed","next","body","temp","more","insert","rest","live","music","table","state","history","shared","expect","blend","total","standard","description","real","model","upgrade","height","forms","smart","howto","implementation","do","using","deleted","procedure","show","sample","site","gets","custom","locate","using","relationships","using","connect","failed","fill","errors","last","test","show","missing","changes","modify","split","location","define","tips","item","mean","support","fixed","default","drop","contain","old","strategy","unique","huge","solution","valid","variable","reboot","include","inside","let","delay","delete","items","extract","save","parent","web","download","resize","close","commercial","how","direction","failed","future","store","position","label","graph","check","match","speed","control","layout","create"];
    	if(stop_tags.indexOf(the_tag) === -1) return true;
    	else return false;
    }

}();

if ( argv.trainlist ) { Mongo_loader.trainlist(); }
else if ( argv.validate ) { Mongo_loader.validate(); }
else if ( argv.genclassifiers ) { Mongo_loader.genclassifiers(); }
else if ( argv.reportlist ) { Mongo_loader.reportlist(); }
else if ( argv.metareportlist ) { Mongo_loader.metareportlist(); }
else if ( argv.reportpurge ) { Mongo_loader.reportpurge(); }
else if ( argv.natural ) { Mongo_loader.natural(); }
else if ( argv.vectorlist ) { Mongo_loader.vectorlist(); }
else if ( argv.vectortest ) { Mongo_loader.vectortest(); }
else if ( argv.vectorpurge ) { Mongo_loader.vectorpurge(); }
else if ( argv.hardpurge ) { Mongo_loader.hardpurge(); }
else if ( argv.help ) { Mongo_loader.help(); }
else { Mongo_loader.help(); }

