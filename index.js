var axios = require('axios').default;
var disk = require('diskusage');
var schedule = require('node-schedule');
require('dotenv').config();

const config = {
	NAME: process.env.NAME,
	SPACE_PATH: process.env.SPACE_PATH || '/',
	GB_FREE: process.env.GB_FREE ? parseInt(process.env.GB_FREE) : 10,
	CRON: process.env.CRON || '0 * * * *',
	PUSHOVER_USER: process.env.PUSHOVER_USER,
	PUSHOVER_SECRET: process.env.PUSHOVER_SECRET,
}

var notifySpace = (free_space)=>{
	return axios.post('https://api.pushover.net/1/messages.json', {
		message: `Server ${config.NAME} is low on space!\nFree space: ${free_space.toFixed(2)}gb`,
		title: `Server ${config.NAME} is low on space!`,
		token: config.PUSHOVER_SECRET,
		user: config.PUSHOVER_USER,
		html: 1,
	});
}

var checkDiskSapce = ()=>{
	disk.check(config.SPACE_PATH, (err, res)=>{
		if(err) return;
		var free_gb = res.free/Math.pow(10, 9);
		if(free_gb<=config.GB_FREE){
			try{
				notifySpace(free_gb).then(()=>{}).catch(()=>{});
			}catch(e){}
		}
	})
}

schedule.scheduleJob(config.CRON, checkDiskSapce);
checkDiskSapce();