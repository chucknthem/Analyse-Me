var DB = (function() {
	var f = {
		'db':null,
		'connectDB':function() {
			this.db = window.openDatabase("analyseMe", "0.1", "Analyse Me Data", 1024*1024);
			if(!this.db) {                                                      
				localStorage['err'] = "database connection failed";
			} else {
				localStorage['err'] = null;
			}
		},
		'fetchPerHour':function(params, callback) {
			if(!this.db) return;
			this.db.transaction(function(tx) {
				var sql = "SELECT host, date, hour, SUM(count) as count FROM analyseMe GROUP BY host, date, hour";
				tx.executeSql(sql, [],
					function(tx, result) {
						var data = [];
						var len = result.rows.length;
						for (var i = 0; i < len; i++) {
							data.push(result.rows.item(i));
						}
						callback(data);
					},
					function(tx, error) {
						localStorage['err'] = "select error:" + error;
					}
				);
			});//end transaction
		},
		'fetchPerDay':function(params, callback) {
			if(!this.db) return;
			this.db.transaction(function(tx) {
				var sql = "SELECT host, date, SUM(count) as count FROM analyseMe GROUP BY host, date";
				tx.executeSql(sql, [],
					function(tx, result) {
						var data = [];
						var len = result.rows.length;
						for (var i = 0; i < len; i++) {
							data.push(result.rows.item(i));
						}
						callback(data);
					},
					function(tx, error) {
						localStorage['err'] = "select error:" + error;
					}
				);
			});//end transaction
		},
		'fetchBest':function(n, callback) {
			if(!this.db) {
				return;
			}
			this.db.transaction(function(tx) {
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
					localStorage['err'] = "select error:" + error;
				}
				);
			});
		},
		/*
		 * try to create the db if it doesn't exist
		 */
		'initDB':function() {
				if(!this.db) return;
				this.db.transaction(
					function(tx) {
						tx.executeSql("SELECT COUNT(*) FROM analyseMe", [], null, 
							function(tx, error) {
								localStorage['err'] = "failed to select:" + error;
								tx.executeSql("CREATE TABLE analyseMe(id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT NOT NULL, date TEXT NOT NULL, hour TINYINT NOT NULL, count INTEGER DEFAULT '0')", [], null, 
									function(tx, error) {
										localStorage['err'] = "failed to create SQL table:" + JSON.stringify(error);
									}
								);
							}
						);
					}
				);
			},
			'insertRow':function(rowObj) {
				if(!this.db) return;
					this.db.transaction(function(tx) {
						tx.executeSql("INSERT INTO analyseMe (host, date, hour, count) VALUES ('" + 
							rowObj['host'] + "','" + rowObj['date'] + "','" + rowObj['hour'] + "', '1')", 
							[], 
							null,
						function(tx, error) {
							localStorage['err'] = "failed to load SQL table:" + JSON.stringify(error);
						});
					});
				},

			/*
			 * increment the count in a given row. If the row doesn't exit, insert it
			 */
		'updateRow': function(rowObj) {
				if(!this.db) return;
					this.db.transaction(function(tx) {
						var sqlStr = "SELECT count FROM analyseMe WHERE host='" + 
							rowObj['host'] + "' AND date='" + rowObj['date'] + "' AND hour='" + rowObj['hour'] + "'";
						tx.executeSql(sqlStr, 
							[], 
							function(tx, result) { //select succeed
								if(result.rows.length == 0) {
									f.insertRow(rowObj);
								} else {
									var count = result.rows.item(0)['count'] + 1;
									var sqlStr = "UPDATE analyseMe SET count='" + count + "' WHERE host='" + 
										rowObj['host'] + "' AND date='" + rowObj['date'] + "' AND hour='" + rowObj['hour'] + "'";
										tx.executeSql(sqlStr, [], null,
										function(tx, error) {
											localStorage['err'] = "failed to update SQL table:" + JSON.stringify(error);
										}); //end execute update
								} //close else
							},
							function(tx, error) { //select error
								localStorage['err'] = "failed to execute select SQL table:" + JSON.stringify(error);
							}
						); //end execute select
					}); //end db transaction
				}
	};
	f.connectDB();
	return f;
})();
