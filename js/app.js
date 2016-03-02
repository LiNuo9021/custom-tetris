Game.App = function() {
	this._engine = null;
	this._attacker = null;
	this._defender = null;

	this._dom = {
		//知识点：querySelector
		left: document.querySelector("#left"),
		right: document.querySelector("#right"),
		attacker: document.querySelector("#attacker"),
		defender: document.querySelector("#defender"),
		play: document.querySelector("#play"),
		setup: document.querySelector("#setup")
	}

	//TODO
	this._select = {
		attacker: this._dom.attacker.querySelector("select"),
		defender: this._dom.defender.querySelector("select")
	}

	this._select.attacker.value = "AI";
	this._select.defender.value = "Human";

	this._dom.play.disabled = false;
	
	this._dom.setup.classList.add("playing");
	setTimeout(this._start.bind(this), 500);
}


Game.App.prototype._start = function() {
	this._dom.play.removeEventListener("click", this);

	this._dom.left.appendChild(this._dom.defender);
	this._dom.right.appendChild(this._dom.attacker);
	
	this._engine = new Game.Engine();

	new Game.Defender["Human"](this._engine);
	new Game.Attacker["AI"](this._engine);
}

