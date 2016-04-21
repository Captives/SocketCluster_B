var argv = require('minimist')(process.argv.slice(2));
var SocketCluster = require('socketcluster').SocketCluster;
var cpus = require("os").cpus();
require('templatizer')(__dirname+"/templates",__dirname+'/public/js/templates.js');

var socketCluster = new SocketCluster({
  brokers: Number(argv.b) || 1,
  workers: Number(argv.w) || cpus.length,
  port: Number(argv.p) || 3000,
  appName: argv.n || null,
  workerController: __dirname + '/worker.js',
  brokerController: __dirname + '/broker.js',
  socketChannelLimit: 1000,
  crashWorkerOnError: argv['auto-reboot'] != false
});
