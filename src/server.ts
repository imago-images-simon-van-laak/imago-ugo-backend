import cluster from 'cluster';
import os from 'os';
import app from './app';
import 'dotenv/config'

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Worker ${process.pid} is listening on port ${port}`);
  });
}
