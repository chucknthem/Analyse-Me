var DB = (function() {
	//private variables
	var db = null; //dabase connection
	/*
	 * param:
	 * startDate - from beginning to endDate if not specified
	 * endDate - set to today if not specified
	 * perDay - if true, return results by day and display a cumulative count. 
	 * 			perDay takes no effect if totalOnly is specified
	 * totalOnly - if true, return results by host and display a cumulative count
	 * 			overrides perDay
	 * limit - maximum number of rows to return
	 * order - field to order by
	 * rorder - field to order by descending
	 * host - specific host only
	 * 
	 * if both order and rorder are specified, the result is undefined. 
	 * i.e. don't do it.
	 * FIXME - do error checks on param format
	 */
	var buildQuery = function(params) {
		if(!params) return;
		var sql = "SELECT host,";
		var where = false
		var args = [];											//sql arguments
		var whereSql = {"startDate":" date >= ? ", 
							"endDate":" date <= ? ",
							"host":" host = ? "};	
	  	if(typeof(params['totalOnly']) != 'undefined') {
			sql += "'total' as date, ";
			sql += " 0 hour, SUM(count) as count ";
		} else if(typeof(params['perDay']) != 'undefined') {
				sql += " 0 hour, SUM(count) as count ";
		} else {
			sql += " hour, count ";
		}
		sql += " FROM analyseMe ";
		//convert params to SQL using the whereSql mappings
		for (var key in whereSql) {
			if(typeof(key) == "string" && params[key]) {
				if(!where) {
					sql += " WHERE ";
					where = true;
				} else {
					sql += " AND ";
				}
				sql += whereSql[key];
				args.push(params[key]);
			}
		}
		if (typeof(params['perDay']) != 'undefined') {
			sql += " GROUP BY host, date ";
		}
		if (typeof(params['order']) != 'undefined') {
			sql += " ORDER BY " + params['order'];
		}
		if (typeof(params['rorder']) != 'undefined') {
			sql += " ORDER BY " + params['rorder'] + " DESC ";
		}
		if (typeof(params['limit']) != 'undefined') {
			sql += " LIMIT ? ";
			args.push(params['limit']);
		}
		return [sql, args];
	}

	/* public methods */
	var f = {
		'connect':function() {
			if(db) return;
			db = window.openDatabase("analyseMe", "0.1", "Analyse Me Data", 1024*1024);
			if(!db) {                                                      
				console.error("database connection failed")
			} 
		},
		/*
		 * fetch rows from the data base based on params
		 * params are used to construct an sql query
		 *
		 * resolution for count is in minutes
		 *
		 * @param params
		 *  - Supported parameters: 
		 *  - @see buildQuery
		 *
		 * @param callback
		 *  - function(dbdata) { //function for dealing with data} 
		 *  - dbdata is an array of table rows: host, hour, date, count
		 *  - e.g. [{host:google.com, hour:3, date:2010-04-05, count:45}, 
		 *  			{host:facebook.com, hour:6, date:2010-04-05, count:58}, 
		 *  			...]
		 *
		 * @param err_callback
		 *  - function(err_msg) {}
		 *  - err_msg is a string
		 *
		 */
		'fetch':function(params, callback, err_call) {
			if(!db || typeof(params) == 'undefined') return;
			db.transaction(function(tx) {
				var sqlArray = buildQuery(params);
				var sql = sqlArray[0];
				var args = sqlArray[1];

				tx.executeSql(sql, args,
					function(tx, result) {
						var data = [];
						var len = result.rows.length;
						for (var i = 0; i < len; i++) {
							var obj = {}; //extract fields from db object
							obj['host'] = result.rows.item(i)['host'];
							obj['date'] = result.rows.item(i)['date'];
							obj['hour'] = result.rows.item(i)['hour'];
							obj['count'] = result.rows.item(i)['count']/6.0;//convert to minutes
							data.push(obj);
						}
						if(typeof(callback) == 'function') {
							callback(data);
						}
					},
					function(tx, error) {
						if(err_call) {
							err_call(error.message);
						} else {
							console.error("select error:" + error.message);
						}
					}
				);
			});//end transaction
		},
		/*
		 * n - past n days
		 * limit - maximum to return. if this is null, data passed to callback
		 * 			will give you a date field in addition to host and count, 
		 * 			which lets you graph the data by day. But to plot all 
		 * 			a total of all hosts you'll have to manually merge all the 
		 * 			hosts (and get rid of the day field)
		 * 			if this is not null, a total minute count for each domain
		 * 			is passed to callback. you won't have to worry about 
		 * 			merging hosts to get a total
		 */
		'fetchPastNDays':function (n, limit, callback, err_call) {
			if (!db) return;
			var today = new Date();
			var todayStr = this.getDateStr(today).split('-');
			var nDaysAgo = new Date(
					todayStr[0],  		//year
					todayStr[1] - 1,	//month (jan = 0)
					todayStr[2] - n,	//day
					today.getHours(),	//hour
					today.getMinutes()//minutes
					);
			var startDate = this.getDateStr(nDaysAgo);
			var param = {'startDate':startDate};
			param['perDay'] = true;
			if (limit) { 
				param['limit'] = limit;
				param['rorder'] = 'count';
				param['totalOnly'] = true; //don't care about which day, just get a total
			}
			this.fetch(param, callback, err_call);
		},	
		/*
		 * returned count resolution is in minutes
		 *
		 * fetch overall n most visited domains
		 * call back takes an object:
		 *  - object['hosts'] = array of top n hosts
		 *  - object['counts'] = array of top n counts of hosts
		 */
		'fetchBest':function(n, callback, err_call) {
			if(!db) {
				if(err_call) err_call("dabase not connected");
			} else {
				db.transaction(function(tx) {
					tx.executeSql("SELECT host, SUM(count) as count FROM analyseMe GROUP BY host ORDER BY count DESC LIMIT " + n, [], 
					function(tx, result) {
						var len = result.rows.length;                         
						var data = {};
						data['hosts'] = [];
						data['counts'] = [];
						for (var i = 0; i < len; i++) {
							data['hosts'].push(result.rows.item(i)['host']);
							data['counts'].push(result.rows.item(i)['count']);
							data['counts'][i] *= 1.0/6; //convert to minutes
						}
						callback(data);
					}, function(tx, error) {
						if(err_call) {
							err_call(error.message);
						} else {
							console.error("select error:" + error.message);
						}
					}
					);
				});
			}
		},
		'fetchHostToday':function(host, callback, err_call) {
			if (!db) return;
			var today = new Date();
			var todayStr = this.getDateStr(today);
			var param = {'host':host, 'perDay':true, 'startDate':todayStr, 'endDate':todayStr};
			this.fetch(param, callback, err_call);
		},
		/*
		 * try to create the table(s) if it doesn't exist
		 */
		'init':function() {
				if(!db) return;
				db.transaction(
					function(tx) {
						tx.executeSql("CREATE TABLE IF NOT EXISTS analyseMe(id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT NOT NULL, date TEXT NOT NULL, hour TINYINT NOT NULL, count INTEGER DEFAULT '0')", [], null, 
							function(tx, error) {
								console.error("failed to create SQL table:" + JSON.stringify(error));
							}
						);
					}
				);
			},
			'insertRow':function(rowObj) {
				if(!db) return;
					db.transaction(function(tx) {
						tx.executeSql("INSERT INTO analyseMe (host, date, hour, count) VALUES (?,?,?,?)", 
							[rowObj['host'], rowObj['date'], rowObj['hour'], 1], 
							null,
						function(tx, error) {
							console.error("failed to load SQL table:" + JSON.stringify(error));
						});
					});
				},

			/*
			 * increment the count in a given row. If the row doesn't exit, insert it
			 */
		'updateRow': function(rowObj) {
			if(!db) return;
			db.transaction(function(tx) {
				var sqlStr = "SELECT count FROM analyseMe WHERE host=? AND date=? AND hour=?";
				tx.executeSql(sqlStr, [rowObj['host'], rowObj['date'], rowObj['hour']],
					function(tx, result) { //select succeed
						if(result.rows.length == 0) {
							f.insertRow(rowObj);
						} else {
							var count = result.rows.item(0)['count'] + 1;
							var sqlStr = "UPDATE analyseMe SET count=? WHERE host=? AND date=? AND hour=?"
								tx.executeSql(sqlStr,
								  [count, rowObj['host'], rowObj['date'], rowObj['hour']],
									null,
								function(tx, error) {
									console.error("failed to update SQL table:" + JSON.stringify(error));
								}); //end execute update
						} //close else
					},
					function(tx, error) { //select error
						console.error("failed to execute select SQL table:" + JSON.stringify(error));
					}
				); //end execute select
			}); //end db transaction
		},//end updateRow

		'deleteAll':function() {
			if(!db) return;
			db.transaction(function(tx) {
				var sqlStr = "DELETE FROM analyseMe";
				tx.executeSql(sqlStr, [], null,
							function(tx, error) {
								console.error("delete Failed");
							}); //end execute update
			});
		}, //end deleteAll
		'getDateStr': function(d) {
			var today =  d;
			var year = today.getFullYear();
			var month = today.getMonth() + 1;
			month = (month < 10)? '0' + month:month;
			var day = today.getDate();
			day = (day < 10)? '0' + day : day;
			var todayStr = [year, month, day].join('-');
			return todayStr;
		}
	};
	f.connect();
	f.init();
	return f;
})();
