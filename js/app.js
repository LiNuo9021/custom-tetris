Game.App = function() {
	this._engine = null;

	this._dom = {
		left: document.querySelector("#left"),
		right: document.querySelector("#right")
	}

	setTimeout(this._start.bind(this), 500);
}


Game.App.prototype._start = function() {
	this._engine = new Game.Engine();

	new Game.Defender["Human"](this._engine);
	new Game.Attacker["AI"](this._engine);
}

