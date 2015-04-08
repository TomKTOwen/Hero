var Enemy = function()
{
	this.image = document.createElement("img");
	
	this.x = canvas.width / 1.5;
	this.y = canvas.height / 2;
		
	this.width = 30;
	this.height = 30;

	this.velocityX = 0;
	this.velocityY = 0;
	
	this.angularVelocity = 0;
	
	this.rotation = 0;
	
	this.image.src = "alien.png";
};

Enemy.prototype.draw = function()
{
	context.save();
	
		context.translate(this.x, this.y);
		context.rotate(this.rotation);
		context.drawImage(this.image, -this.width / 1, -this.height / 1);
	
	context.restore();
}