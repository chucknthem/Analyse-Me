var DB = (function() {
	var f = {
		'db':null,
		'connectDB':function() {
			this.db = window.openDatabase("analyseMe", "0.1", "Analyse Me Data", 1024*1024);
			if(!this.db) {                                                      
				console.error("database connection failed")
			} 
		},
		/*
		 * Supported parameters: startDate
		 */
		'fetchPerHour':function(params, callback) {
			if(!this.db) return;
			this.db.transaction(function(tx) {
				var sql = "SELECT host, date, hour, SUM(count) as count FROM analyseMe GROUP BY host, date, hour";
				if (params) {
					sql += " WHERE ";
					if(typeof(params['startDate'] != 'undefined')) {
						sql += " hour >= '" + params['startDate'] + "'";
					}
				}
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
						console.error("select error:" + error.message);
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
						console.error("select error:" + error.message);
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
					console.error("select error:" + error.message);
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
								console.error("failed to select:" + error.message);
								tx.executeSql("CREATE TABLE analyseMe(id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT NOT NULL, date TEXT NOT NULL, hour TINYINT NOT NULL, count INTEGER DEFAULT '0')", [], null, 
									function(tx, error) {
										console.error("failed to create SQL table:" + JSON.stringify(error));
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
			if(!this.db) return;
			this.db.transaction(function(tx) {
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
			if(!this.db) return;
			this.db.transaction(function(tx) {
				var sqlStr = "DELETE FROM analyseMe";
				tx.executeSql(sqlStr, [], null,
							function(tx, error) {
								console.error("delete Failed");
							}); //end execute update
			});
		} //end deleteAll

	};
	f.connectDB();
	return f;
})();
