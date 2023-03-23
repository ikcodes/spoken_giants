function isDark(){	// Returns true if the site is Dark.
	
	const makeItGray = false;
	const makeItFull = false;
	
	// Define start and end of go-dark.
	var start = 1603407600;	// 10.22.2020 11:00PM utc
	var end = 1603710000;		// 10.26.2020 11:00AM utc
	
	var now = Math.ceil(Date.now() / 1000);
	
	// Is UTC between start and end?
	if(makeItGray === true){
		return true;
	}else if(makeItFull === true){
		return false;
	}else{
		return start <= now && now <= end;
	}
}

module.exports = { isDark };