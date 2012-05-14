////////////////////////////////////////////////////////////////////////////
// initStats

var initStats = function(api, next){
	api.stats = {};
	// actionHero::stats redis stats object

	if(api.redis.enable !== true){
		api.stats.data = {};
	}

	api.stats.incrament = function(api, key, count, next){
		if(count == null){ count = 1; }
		count = parseFloat(count);
		if(api.redis.enable === true){
			api.redis.client.hincrby("actionHero::stats", key, count, function(){
				if(typeof next == "function"){ process.nextTick(function() { next(true); }); }
			});
		}else{
			if(api.stats.data[key] == null){
				api.stats.data[key] = 0;
			}
			api.stats.data[key] = api.stats.data[key] + count;
			if(typeof next == "function"){ process.nextTick(function() { next(true); }); }
		}
	}

	api.stats.get = function(api, key, next){
		if(api.redis.enable === true){
			api.redis.client.hget("actionHero::stats", key, function (err, cacheObj){
				next(cacheObj);
			});
		}else{
			next(api.stats.data[key]);
		}
	}
	
	api.stats.load = function(api, next){
		var stats = {};
		var now = new Date().getTime();
		stats.uptimeSeconds = (now - api.bootTime) / 1000;
		api.cache.size(api, function(numberOfCacheObjects){
			api.stats.get(api, "numberOfSocketRequests", function(numberOfSocketRequests){
				api.stats.get(api, "numberOfActiveSocketClients", function(numberOfActiveSocketClients){
					api.stats.get(api, "numberOfWebRequests", function(numberOfWebRequests){
						api.stats.get(api, "numberOfPeers", function(numberOfPeers){

							if(numberOfCacheObjects == null){numberOfCacheObjects = 0;}
							if(numberOfSocketRequests == null){numberOfSocketRequests = 0;}
							if(numberOfActiveSocketClients == null){numberOfActiveSocketClients = 0;}
							if(numberOfWebRequests == null){numberOfWebRequests = 0;}
							if(numberOfPeers == null){numberOfPeers = 0;}

							numberOfCacheObjects = parseInt(numberOfCacheObjects);
							numberOfSocketRequests = parseInt(numberOfSocketRequests);
							numberOfActiveSocketClients = parseInt(numberOfActiveSocketClients);
							numberOfWebRequests = parseInt(numberOfWebRequests);
							numberOfPeers = parseInt(numberOfPeers);
							
							stats.memoryConsumption = process.memoryUsage().heapUsed;
							stats.cache = {
								numberOfObjects: numberOfCacheObjects
							};
							stats.socketServer = {
								numberOfSocketRequests: numberOfSocketRequests,
								numberOfActiveSocketClients: numberOfActiveSocketClients
							};
							stats.webServer = {
								numberOfWebRequests: numberOfWebRequests
							};
							stats.actionCluster = {
								peers: numberOfPeers
							};

							if(typeof next == "function"){ next(stats); }
						});
					});
				});
			});
		});
	}
	
	next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.initStats = initStats;
