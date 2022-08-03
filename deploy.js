const Colors = require('colors');
const zk = require('./internal/zookeeper/zookeep');
const { Zookeeper } = require('./external/constants/configs');

zk.getConfig()
  .then((data) => {
    Object.assign(Zookeeper, data);
    console.log(Colors.green(' *** Init Configs zookeeper Success ***'));
    require('./init');
    require('./gprc/node');
  })
  .catch((error) => {
    console.log(Colors.red('Please install or start zookeeper.'), error);
    process.exit(1);
  });
