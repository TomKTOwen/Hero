var Player = function()
{
	//load up sprite instead of image
	this.sprite = new Sprite("ChuckNorris.png");
	
	//set up all the animations
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[0, 1, 2, 3, 4, 5, 6, 7]); //left idle animations
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[8, 9, 10, 11, 12]); //left jump animation
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
		[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]); // left walk animation
		
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, //right idle animation
		[52, 53, 54, 55, 56, 57, 58, 59]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, //right jump animation
		[60, 61, 62, 63, 64]);
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, //right walk animation
		[65, 66, 67, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
	
	this.health = 100;

	
	this.width = 165;
	this.height = 125;
	for ( var i = 0 ; i < ANIM_MAX ; ++i)
	{
		this.sprite.setAnimationOffset(idle
									-this.width/2, -this.height/2);
	}
	
	this.startPos = new Vector2();
	this.startPos.set(480, 3450);
	
	this.position = new Vector2();
	this.position.set(canvas.width / 1000, canvas.height / 1.2);
	
	this.x = canvas.width / 2;
	this.y = canvas.height / 2;
	
	this.jumping = false;
	this.falling = false;
	
	this.direction = LEFT;
	
	this.velocity = new Vector2();
	this.angularVelocity = 0;

	this.rotation = 0;
	
	/*
	this.heartImage = document.createElement("img");
	this.heartImage.src = "heart.png";
	*/
};


Player.prototype.changeDirectionalAnimation = function(leftAnim, rightAnim)
{
	if ( this.direction == LEFT)
	{
		if ( this.sprite.currentAnimation != leftAnim )
		{
			this.sprite.setAnimation( leftAnim );
		}
	}
	else if ( this.direction == RIGHT)
	{
		if ( this.sprite.currentAnimation != rightAnim )
		{
			this.sprite.setAnimation(rightAnim);
		}
	}
}

Player.prototype.update = function(deltaTime)
{
	this.sprite.update(deltaTime);


	var acceleration = new Vector2();
	var playerAccel = 5000;
	var jumpForce = 55000;
	var playerDrag = 11;
	var playerGravity = TILE * 9.8 * 6;
	
	acceleration.y = playerGravity;
	
	if ( keyboard.isKeyDown(keyboard.KEY_A) )
	{
		acceleration.x -= playerAccel;
		this.direction = LEFT;
	}
	if ( keyboard.isKeyDown(keyboard.KEY_D) )
	{
		acceleration.x += playerAccel;
		this.direction = RIGHT;
	}
	
	if ( this.velocity.y > 0 )
	{
		this.falling = true;
	}
	else
	{
		this.falling = false;
	}
	
	if ( keyboard.isKeyDown (keyboard.KEY_W) && !this.jumping && !this.falling) 
	{
		acceleration.y -= jumpForce;
		this.jumping = true;
	}
	if ( keyboard.isKeyDown(keyboard.KEY_DOWN) )
	{
		acceleration.y += playerAccel;
	}
	
	
	var dragVector = this.velocity.multiplyScalar(playerDrag);
	dragVector.y = 0;
	acceleration = acceleration.subtract(dragVector);
	
	//acceleration = acceleration.subtract(this.velocity.multiplySclar(playerDrag));
	this.velocity = this.velocity.add(acceleration.multiplyScalar(deltaTime));
	this.position = this.position.add(this.velocity.multiplyScalar(deltaTime));
	
	if ( this.jumping || this.falling )
	{
		this.changeDirectionalAnimation(ANIM_JUMP_LEFT, ANIM_JUMP_RIGHT);
	}
	else
	{
		if ( Math.abs(this.velocity.x) > 25)
		{
			this.changeDirectionalAnimation(ANIM_WALK_LEFT, ANIM_WALK_RIGHT);
		}
		else
		{
			this.changeDirectionalAnimation(ANIM_IDLE_LEFT, ANIM_IDLE_RIGHT);
		}
	}
	
	var collisionOffset = new Vector2();
	collisionOffset.set(70,90);
	var collisionPos = this.position.add(collisionOffset);
	
	
	var tx = pixelToTile(collisionPos.x);
	var ty = pixelToTile(collisionPos.y);

	
	var nx = this.position.x % TILE;
	var ny = this.position.y % TILE;
	
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cell_right = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty);
	var cell_down = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+1);
	var cell_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+1);
	
	//actual collision checks
	if ( this.velocity.y > 0 ) //if moving down 
	{
		if ( (cell_down && !cell) || (cell_diag && !cell_right && nx) )
		{
			this.position.y = tiletoPixel(ty) - collisionOffset.y;
			this.velocity.y = 0;
			ny = 0;
			this.jumping = false;
			
		}
	}
	else if (this.velocity.y < 0 ) //if moving up
	{
		if ( (cell && !cell_down) || (cell_right && !cell_diag && nx) )
		{
			this.position.y = tiletoPixel(ty + 1) - collisionOffset.y;
			this.velocity.y = 0;
			
			cell = cell_down;
			cell_right = cell_diag;
			cell_down = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+2);
			cell_diag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+2);
			ny = 0;	
		}
	}
	
	if (this.velocity.x > 0 ) //if moving right
	{
		if ( (cell_right && !cell) || (cell_diag && !cell_down && ny) )
		{
			this.position.x = tiletoPixel(tx) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}
	else if (this.velocity.x < 0 ) //if moving left
	{
		if ( (cell && !cell_right) || (cell_down && !cell_diag && ny) )
		{
			this.position.x = tiletoPixel(tx+1) - collisionOffset.x;
			this.velocity.x = 0;
		}
	}
	
	if ( this.position.y > MAP.th * TILE + this.height)
	{
		this.position.set(this.startPos.x, this.startPos.y);
		this.velocity.set(0,0);
		this.health = 5;
		timer = 0;	
	
	}	
	
	
}
	


Player.prototype.draw = function(offsetX, offsetY)
{
	this.sprite.draw(context, this.position.x - offsetX, this.position.y - offsetY);
	/*
	for ( var h = 0 ; h < this.health ; ++h)
	{
		context.drawImage(this.heartImage, 50 + 20 *h, 50);
	}
	*/
	
	context.fillStyle = "black";
	context.font="32px Arial";
	var textToDisplay = "HP" + this.health;
	context.fillText(textToDisplay, canvas.width - 150, 150);
}