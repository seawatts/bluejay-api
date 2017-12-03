import * as moment from 'moment';
import {
  freemem,
  loadavg,
  totalmem,
  uptime,
} from 'os';
import ApplicationAction from './application';

export default class HealthcheckAction extends ApplicationAction {
  protected = false;

  respond() {
    let processMemoryUsage = process.memoryUsage();
    let osFreeMemory = freemem();
    let osTotalMemory = totalmem();
    let osUsedMemoryPercent = osFreeMemory / osTotalMemory * 100;
    let osUsedMemory = formatBytes(osTotalMemory - osFreeMemory);
    Object.assign(processMemoryUsage, {
      rss: formatBytes(processMemoryUsage.rss),
      heapTotal: formatBytes(processMemoryUsage.heapTotal),
      heapUsed: formatBytes(processMemoryUsage.heapUsed),
    });
    let freeMemory = formatBytes(osFreeMemory);
    let totalMemory = formatBytes(osTotalMemory);
    const { env: { NODE_ENV = 'development' } } = process;
    let healthObject = {
      environment: NODE_ENV,
      // version: this.config.version,
    };
    // if (NODE_ENV !== 'production') {
      Object.assign(healthObject, {
        // database,
        // logging: config.logging,
        process: {
          memory: processMemoryUsage,
          uptime: moment().subtract({ seconds: process.uptime() }).fromNow(),
          up: process.uptime(),
          cpuUsage: process.cpuUsage(),
        },
        os: {
          // cpus: cpus(),
          // hostname: hostname(),
          loadavg: loadavg(),
          memory: {
            percentUsed: osUsedMemoryPercent,
            used: osUsedMemory,
            free: freeMemory,
            total: totalMemory,
          },
          // networkInterfaces: networkInterfaces(),
          // platform: platform(),
          uptime: moment(uptime(), 's').fromNow(),
          up: uptime(),
        },
      });
    // }
    return this.render(200, healthObject, { serializer: 'json' });
  }
}

function formatBytes(bytes: number, decimals?: number): string {
  if (bytes === 0) {
    return '0 Byte';
  }
  let k = 1000; // or 1024 for binary
  let dm = decimals + 1 || 3;
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
