Game.Attacker.AI = function(engine) {
	//知识点：call()
	//解：Game.Attacker相当于是Game.Player的之类
	Game.Player.call(this, engine);//给该对象赋引擎
	this._lastType = "";
	//知识点：setInterval()————每隔100ms，就绑定一次_poll
	//知识点：bind()
	this._interval = setInterval(this._poll.bind(this), Game.INTERVAL_ATTACKER);//周期性下降滑块
	this._executeCount = 0;
}

Game.Attacker.AI.prototype = Object.create(Game.Player.prototype);

Game.Attacker.AI.prototype.destroy = function() {
	clearInterval(this._interval); 
	this._interval = null;
	Game.Player.prototype.destroy.call(this);
}

Game.Attacker.AI.prototype._poll = function() {
	console.log("poll executeCount: " + (++this._executeCount));

	//有_nextType，就不执行此函数
	var next = this._engine.getNextType();//第一、二次为""
	if (next) { return; }

	//知识点：Object.keys()
	//avail是字符串数组，元素是每个滑块对应的字符串："+" "o" "i"
	var avail = Object.keys(this._engine.getAvailableTypes());

	/* remove last used type, if possible */
	var index = avail.indexOf(this._lastType);//第一次为-1，因为_lastType为""；第二次为8，因为滑块是"+"
	if (index > -1 && avail.length > 1) { 
		avail.splice(index, 1); 
	}

	/*
	20行10列的游戏空间，包含4个对象：
	cells：Object，初始为空
	nodes：div.pit
	cols：20个元素的数组，元素初始都为0
	rows：10个元素的数组，元素初始都为0
	*/
	var pit = this._engine.pit;
	var current = this._engine.getPiece();//第一次为null；第二次为"+"的Piece对象

	if (current) { /* drop current piece based on its expected position/rotation */
		pit = pit.clone();
		current = current.clone();

		var best = Game.AI.findBestPositionRotation(pit, current);
		for (var i=0;i<best.rotation;i++) { current.rotate(+1); }
		current.xy = new XY(best.x, Game.DEPTH);
		pit.drop(current);
	}

	var scores = Game.AI.scoreTypes(pit, avail);
	var worstScore = -Infinity;
	var worstTypes = [];

	//这段代码第一次执行，会将"+"－64筛选出来，所以每次都是最先落下加号
	// for (var type in scores) {
	// 	var score = scores[type];
	// 	if (score > worstScore) {
	// 		worstScore = score;
	// 		worstTypes = [];
	// 	}
	// 	if (score == worstScore) { worstTypes.push(type); }
	// }

	//随机获取方块
	//改造：不先出最高分数，而是随机挑选
	// var type = worstTypes.random();
	var type = Object.keys(scores).random();
	this._lastType = type;
	this._engine.setNextType(type);//向_availableTypes放置滑块及其数量，第一次执行后，游戏区域顶部会出现+滑块
}
