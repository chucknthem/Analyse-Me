var DB = (function() {
	//private variables
	var db = null; //dabase connection
	/*
	 * param:
	 * startDate - from beginning to endDate if not specified
	 * endDate - set to today if not specified
	 * perDay - if true, return results by day and display a cumulative count
	 * limit - maximum number of rows to return
	 * FIXME - do error checks on param format
	 */
	var buildQuery = function(params) {
		if(!params) return;
		var sql = "SELECT host, date, ";
		var where = false
		var args = [];											//sql arguments
		var whereSql = {"startDate":" date >= ? ", 
							"endDate":" date <= ? "};	
		if(typeof(params['perDay']) != 'undefined') {
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
		if (typeof(params['limit']) != 'undefined') {
			sql += " LIMIT ? ";
			args.push(params['limit']);
		}
		return [sql, args];
	}
	var f = {
		'connect':function() {
			if(db) return;
			db = window.openDatabase("analyseMe", "0.1", "Analyse Me Data", 1024*1024);
			if(!db) {                                                      
				console.error("database connection failed")
			} 
		},
		/*
		 * Supported parameters: 
		 * startDate - from beginning to endDate if not specified
		 * endDate - set to today if not specified
		 * perDay - if true, return results by day and display a cumulative count
		 * limit - maximum number of rows to return
		 */
		'fetch':function(params, callback, err_call) {
			if(!db || typeof(params) == 'undefined') return;
			db.transaction(function(tx) {
				var sqlArray = buildQuery(params);
				var sql = sqlArray[0];
				var args = sqlArray[1];
				console.log(sqlArray);
				tx.executeSql(sql, args,
					function(tx, result) {
						var data = [];
						var len = result.rows.length;
						for (var i = 0; i < len; i++) {
							data.push(result.rows.item(i));
						}
						console.log(data);
						if(typeof(callback) == 'Function') {
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
		//new Date(year, month, day, hours, minutes, seconds, milliseconds)
		'fetchPastNDays':function (n, callback, err_call) {
			if (!db) return;
			var today = new Date().toISOString().split(/T/)[0].split('-');
			var nDaysAgo = new Date(today[0], today[1], today[2]);
			var startDate = nDaysAgo.toISOString().split(/T/)[0];
			this.fetch({'startDate':startDate}, callback, err_call);
		},	
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
		} //end deleteAll
	};
	f.connect();
	f.init();
	return f;
})();
