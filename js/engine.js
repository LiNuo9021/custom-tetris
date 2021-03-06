Game.Engine = function() {
	this._status = {
		score: 0,
		playing: true
	}

	this._interval = null;
	this._dropping = false;
	this._availableTypes = {};

	this._setScore(0);
	this._setPlaying(true);

	this.gallery = new Game.Gallery(this);
	this.pit = new Game.Pit();
	this.pit.build();

	document.querySelector("#left").appendChild(this.pit.node);
	document.querySelector("#right").appendChild(this.gallery.node);
	
	this._piece = null;
	this._nextType = "";
	this._refreshAvailable();
	this.gallery.sync();
}

Game.Engine.prototype.setNextType = function(nextType) {
	var avail = this._availableTypes[nextType] || 0;
	if (avail < 1) { return; }

	this._nextType = nextType;
	if (!this._piece) { //第一次执行会走这里
		this._useNextType(); 
	} else { //第二次执行会走这里，会将下一个滑块在仓库区域加红
		this.gallery.sync();
	}
	return this;
}

Game.Engine.prototype.getAvailableTypes = function() {
	return this._availableTypes;
}

Game.Engine.prototype.getPiece = function() {
	return this._piece;
}

Game.Engine.prototype.getStatus = function() {
	return this._status;
}

Game.Engine.prototype.getNextType = function() {
	return this._nextType;
}

Game.Engine.prototype.drop = function() {
	if (!this._piece || this._dropping) { return; }

	var gravity = new XY(0, -1);
	while (this._piece.fits(this.pit)) {
		this._piece.xy = this._piece.xy.plus(gravity);
	}
	this._piece.xy = this._piece.xy.minus(gravity);

	this._stop();
	this._dropping = true;
	setTimeout(this._drop.bind(this), Game.INTERVAL_DROP);
	return this;
}

Game.Engine.prototype.rotate = function() {
	if (!this._piece || this._dropping) { return; }
	this._piece.rotate(+1);
	if (!this._piece.fits(this.pit)) { this._piece.rotate(-1); }
	return this;
}

Game.Engine.prototype.shift = function(direction) {
	if (!this._piece || this._dropping) { return; }
	var xy = new XY(direction, 0);
	this._piece.xy = this._piece.xy.plus(xy);
	if (!this._piece.fits(this.pit)) { this._piece.xy = this._piece.xy.minus(xy); }
	return this;
}

/**
 * After drop timeout
 */
Game.Engine.prototype._drop = function() {
	this._dropping = false;
	var removed = this.pit.drop(this._piece);//计算删除数
	this._piece = null;
	this._setScore(this._status.score + this._computeScore(removed));//每次下落都更新分数：已有分数＋消除分数
	if (this._nextType) { this._useNextType(); }
}


Game.Engine.prototype._refreshAvailable = function() {
	for (var type in Game.Piece.DEF) {
		this._availableTypes[type] = Game.Piece.DEF[type].avail;
	}
}

//知识点：prototype
Game.Engine.prototype._useNextType = function() {
	//_availableTypes存放着每种滑块的数量，这里做－1操作
	var avail = this._availableTypes[this._nextType]-1;
	if (avail) {
		this._availableTypes[this._nextType] = avail;
	} else {
		delete this._availableTypes[this._nextType];
	}
	if (!Object.keys(this._availableTypes).length) { 
		this._refreshAvailable(); 
	}
	
	var nextPiece = new Game.Piece(this._nextType);//构造滑块
	nextPiece.center();
	nextPiece.build(this.pit.node);//这句话之后，滑块构造完毕并出现在游戏区域正中

	//如果滑块在游戏区域内，则开始游戏；否则游戏结束
	if (nextPiece.fits(this.pit)) {
		this._piece = nextPiece;
		this._nextType = "";
		this._start();
	} else { /* game over */
		this._setPlaying(false);
	}

	this.gallery.sync();
}

Game.Engine.prototype._setScore = function(score) {
	this._status.score = score;
	document.querySelector("#score").innerHTML = score;
}

//滑块的bottom－25px
Game.Engine.prototype._tick = function() {
	var gravity = new XY(0, -1);
	this._piece.xy = this._piece.xy.plus(gravity);
	if (!this._piece.fits(this.pit)) {
		this._piece.xy = this._piece.xy.minus(gravity);
		this.drop();
	}
}

Game.Engine.prototype._computeScore = function(removed) {
	if (!removed) { return 0; }
	return 100 * (1 << (removed-1));
}

Game.Engine.prototype._setPlaying = function(playing) {
	this._status.playing = playing;
	document.querySelector("#status").innerHTML = (playing ? "Playing" : "GAME OVER");
}

//滑块下落的函数
Game.Engine.prototype._start = function() {
	if (this._interval) { return; }
	this._interval = setInterval(this._tick.bind(this), Game.INTERVAL_ENGINE);
	Game.INTERVAL_ENGINE -= 5;
}

Game.Engine.prototype._stop = function() {
	if (!this._interval) { return; }
	clearInterval(this._interval);
	this._interval = null;
}
